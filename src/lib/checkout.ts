import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { formatMoney } from "./money";
import { getSettings, shippingCost, type StoreSettings } from "./settings";
import type { PaymentMethod, ShippingMethod } from "./orders";

export class CheckoutError extends Error {}

type Client = Prisma.TransactionClient | typeof db;

export type CheckoutLine = { variantId: string; quantity: number };

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postcode: string;
  phone?: string | null;
};

export type PlaceOrderInput = {
  email: string;
  userId?: string | null;
  items: CheckoutLine[];
  address: CheckoutAddress;
  saveAddress?: boolean;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  customerNote?: string | null;
  researchAck: boolean;
};

export type CouponQuote = {
  code: string;
  description: string | null;
  type: string;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  discount: number;
};

/** Merge duplicate lines and drop nonsense quantities. */
function normaliseLines(lines: CheckoutLine[]) {
  const merged = new Map<string, number>();
  for (const line of lines) {
    const qty = Math.floor(line.quantity);
    if (!line.variantId || !Number.isFinite(qty) || qty <= 0) continue;
    merged.set(line.variantId, Math.min(99, (merged.get(line.variantId) ?? 0) + qty));
  }
  return [...merged.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

export function discountFor(coupon: { type: string; value: number }, subtotal: number) {
  if (coupon.type === "PERCENT") return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  return Math.min(subtotal, coupon.value);
}

/** Validates a coupon against a subtotal. Throws CheckoutError with a customer-facing message. */
export async function validateCoupon(rawCode: string, subtotal: number, client: Client = db): Promise<CouponQuote> {
  const code = rawCode.trim().toUpperCase();
  const coupon = code ? await client.coupon.findUnique({ where: { code } }) : null;
  const now = new Date();
  if (!coupon || !coupon.active) throw new CheckoutError("That discount code isn't valid.");
  if (coupon.startsAt && coupon.startsAt > now) throw new CheckoutError("That discount code isn't active yet.");
  if (coupon.expiresAt && coupon.expiresAt < now) throw new CheckoutError("That discount code has expired.");
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new CheckoutError("That discount code has reached its usage limit.");
  }
  if (subtotal < coupon.minSubtotal) {
    throw new CheckoutError(
      `This code requires a minimum order of ${formatMoney(coupon.minSubtotal)}.`,
    );
  }
  return {
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxUses: coupon.maxUses,
    discount: discountFor(coupon, subtotal),
  };
}

export type QuotedLine = {
  variantId: string;
  quantity: number;
  available: boolean;
  stock: number;
  price: number;
  productName: string;
  productSlug: string;
  variantLabel: string;
  sku: string;
  image: string;
};

/** Current price and availability for cart lines (used to refresh client-side carts). */
export async function quoteLines(lines: CheckoutLine[]): Promise<QuotedLine[]> {
  const normalised = normaliseLines(lines);
  const variants = await db.productVariant.findMany({
    where: { id: { in: normalised.map((l) => l.variantId) } },
    include: { product: true },
  });
  return normalised.map((line) => {
    const v = variants.find((x) => x.id === line.variantId);
    if (!v) {
      return {
        variantId: line.variantId,
        quantity: line.quantity,
        available: false,
        stock: 0,
        price: 0,
        productName: "Unavailable item",
        productSlug: "",
        variantLabel: "",
        sku: "",
        image: "",
      };
    }
    return {
      variantId: v.id,
      quantity: line.quantity,
      available: v.active && v.product.active && v.stock > 0,
      stock: v.stock,
      price: v.price,
      productName: v.product.name,
      productSlug: v.product.slug,
      variantLabel: v.label,
      sku: v.sku,
      image: v.image ?? v.product.image,
    };
  });
}

async function nextOrderNumber(client: Client, settings: StoreSettings, attempt: number) {
  const count = await client.order.count();
  return `${settings.orderPrefix}-${10240 + count + attempt}`;
}

function isUniqueViolation(error: unknown, field?: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
  if (!field) return true;
  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes(field) : String(target ?? "").includes(field);
}

/**
 * Creates an order atomically: re-prices from the database, checks stock, applies the coupon,
 * decrements inventory and records the first order event. Throws CheckoutError for customer-facing problems.
 */
export async function placeOrder(input: PlaceOrderInput) {
  const settings = await getSettings();
  const lines = normaliseLines(input.items);
  if (lines.length === 0) throw new CheckoutError("Your cart is empty.");
  if (!input.researchAck) throw new CheckoutError("Please confirm the research-use acknowledgement.");

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        const variants = await tx.productVariant.findMany({
          where: { id: { in: lines.map((l) => l.variantId) } },
          include: { product: true },
        });

        const items = lines.map((line) => {
          const v = variants.find((x) => x.id === line.variantId);
          if (!v || !v.active || !v.product.active) {
            throw new CheckoutError("An item in your cart is no longer available. Please review your cart.");
          }
          if (v.stock < line.quantity) {
            throw new CheckoutError(
              v.stock > 0
                ? `Only ${v.stock} × ${v.product.name} ${v.label} left in stock. Please reduce the quantity.`
                : `${v.product.name} ${v.label} is out of stock. Please remove it from your cart.`,
            );
          }
          return {
            variantId: v.id,
            productName: v.product.name,
            variantLabel: v.label,
            sku: v.sku,
            image: v.image ?? v.product.image,
            unitPrice: v.price,
            quantity: line.quantity,
            lineTotal: v.price * line.quantity,
          };
        });

        const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
        let discount = 0;
        let couponCode: string | null = null;
        if (input.couponCode?.trim()) {
          const coupon = await validateCoupon(input.couponCode, subtotal, tx);
          discount = coupon.discount;
          couponCode = coupon.code;
          // Conditional increment so concurrent orders can't exceed maxUses.
          const claimed = await tx.coupon.updateMany({
            where: { code: coupon.code, ...(coupon.maxUses != null ? { usedCount: { lt: coupon.maxUses } } : {}) },
            data: { usedCount: { increment: 1 } },
          });
          if (claimed.count !== 1) throw new CheckoutError("That discount code has reached its usage limit.");
        }

        for (const item of items) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count !== 1) {
            throw new CheckoutError(`${item.productName} ${item.variantLabel} just sold out. Please review your cart.`);
          }
        }

        const shipping = shippingCost(settings, input.shippingMethod, subtotal - discount);
        const a = input.address;

        const created = await tx.order.create({
          data: {
            number: await nextOrderNumber(tx, settings, attempt),
            accessToken: randomBytes(16).toString("hex"),
            userId: input.userId ?? null,
            email: input.email.toLowerCase(),
            status: "PENDING_PAYMENT",
            paymentMethod: input.paymentMethod,
            paymentStatus: "UNPAID",
            subtotal,
            discount,
            shipping,
            total: subtotal - discount + shipping,
            couponCode,
            shippingMethod: input.shippingMethod,
            shipFirstName: a.firstName,
            shipLastName: a.lastName,
            shipCompany: a.company || null,
            shipLine1: a.line1,
            shipLine2: a.line2 || null,
            shipCity: a.city,
            shipState: a.state,
            shipPostcode: a.postcode,
            shipCountry: "Australia",
            shipPhone: a.phone || null,
            customerNote: input.customerNote || null,
            researchAck: true,
            items: { create: items },
            events: {
              create: { type: "STATUS", status: "PENDING_PAYMENT", message: "Order placed. Awaiting payment." },
            },
          },
          include: { items: true },
        });

        if (input.userId && input.saveAddress) {
          const existing = await tx.address.findFirst({
            where: { userId: input.userId, line1: a.line1, postcode: a.postcode },
          });
          if (!existing) {
            const hasDefault = await tx.address.count({ where: { userId: input.userId, isDefault: true } });
            await tx.address.create({
              data: {
                userId: input.userId,
                firstName: a.firstName,
                lastName: a.lastName,
                company: a.company || null,
                line1: a.line1,
                line2: a.line2 || null,
                city: a.city,
                state: a.state,
                postcode: a.postcode,
                phone: a.phone || null,
                isDefault: hasDefault === 0,
              },
            });
          }
        }

        return created;
      });

      return order;
    } catch (error) {
      if (isUniqueViolation(error, "number") && attempt < 4) continue;
      throw error;
    }
  }
  throw new CheckoutError("We couldn't create your order. Please try again.");
}
