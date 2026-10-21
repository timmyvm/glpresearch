"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword, startSession } from "@/lib/auth";
import { CheckoutError, placeOrder, quoteLines, validateCoupon, type QuotedLine } from "@/lib/checkout";
import { sendNewOrderNotification, sendOrderConfirmation } from "@/lib/order-emails";
import { getSettings } from "@/lib/settings";
import { revalidateStorefront } from "@/lib/revalidate";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "@/lib/orders";
import { AU_STATES } from "@/components/checkout/au-states";

const linesSchema = z
  .array(z.object({ variantId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(99) }))
  .max(50);

/** Current prices/availability for a client-side cart. */
export async function refreshCart(lines: { variantId: string; quantity: number }[]): Promise<QuotedLine[]> {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return [];
  return quoteLines(parsed.data);
}

export type CouponResult =
  | { ok: true; code: string; description: string | null; type: string; value: number; minSubtotal: number; discount: number }
  | { ok: false; error: string };

export async function previewCoupon(code: string, lines: { variantId: string; quantity: number }[]): Promise<CouponResult> {
  const parsedCode = z.string().trim().min(1).max(40).safeParse(code);
  const parsedLines = linesSchema.safeParse(lines);
  if (!parsedCode.success || !parsedLines.success) return { ok: false, error: "Enter a discount code." };
  const quoted = await quoteLines(parsedLines.data);
  const subtotal = quoted.filter((l) => l.available).reduce((s, l) => s + l.price * l.quantity, 0);
  try {
    const coupon = await validateCoupon(parsedCode.data, subtotal);
    return {
      ok: true,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minSubtotal: coupon.minSubtotal,
      discount: coupon.discount,
    };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message };
    throw error;
  }
}

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const checkoutSchema = z
  .object({
    email: z.email("Enter a valid email address").max(200),
    items: linesSchema.min(1, "Your cart is empty."),
    firstName: z.string().trim().min(1, "Required").max(60),
    lastName: z.string().trim().min(1, "Required").max(60),
    company: optional(120),
    line1: z.string().trim().min(3, "Enter a street address").max(160),
    line2: optional(160),
    city: z.string().trim().min(2, "Enter a suburb or city").max(80),
    state: z.enum(AU_STATES.map((s) => s.code) as [string, ...string[]], { error: "Choose a state" }),
    postcode: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit postcode"),
    phone: optional(30),
    saveAddress: z.boolean().default(false),
    shippingMethod: z.enum(Object.keys(SHIPPING_METHODS) as [keyof typeof SHIPPING_METHODS], { error: "Choose a shipping method" }),
    paymentMethod: z.enum(Object.keys(PAYMENT_METHODS) as [keyof typeof PAYMENT_METHODS], { error: "Choose a payment method" }),
    couponCode: optional(40),
    customerNote: optional(1000),
    researchAck: z.literal(true, { error: "Please confirm research-use only" }),
    termsAck: z.literal(true, { error: "Please agree to the Terms of Sale" }),
    createAccount: z.boolean().default(false),
    password: z.string().max(128).optional(),
  })
  .superRefine((d, ctx) => {
    if (!d.createAccount) return;
    const pw = d.password ?? "";
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "8+ characters with a letter and a number" });
    }
  });

export type CheckoutPayload = z.input<typeof checkoutSchema>;

export type CheckoutResult =
  | { ok: true; number: string; token: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
    };
  }
  const d = parsed.data;
  const email = d.email.toLowerCase();

  let user = await getCurrentUser();
  if (!user && d.createAccount && d.password) {
    const exists = await db.user.findUnique({ where: { email } });
    if (!exists) {
      const created = await db.user.create({
        data: {
          email,
          passwordHash: await hashPassword(d.password),
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone ?? null,
          institution: d.company ?? null,
          lastLoginAt: new Date(),
        },
      });
      await startSession(created);
      user = await db.user.findUnique({
        where: { id: created.id },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, institution: true, role: true, status: true, marketingOptIn: true, createdAt: true },
      });
    }
  }

  try {
    const order = await placeOrder({
      email,
      userId: user?.id ?? null,
      items: d.items,
      address: {
        firstName: d.firstName,
        lastName: d.lastName,
        company: d.company,
        line1: d.line1,
        line2: d.line2,
        city: d.city,
        state: d.state,
        postcode: d.postcode,
        phone: d.phone,
      },
      saveAddress: !!user && (d.saveAddress || d.createAccount),
      shippingMethod: d.shippingMethod,
      paymentMethod: d.paymentMethod,
      couponCode: d.couponCode,
      customerNote: d.customerNote,
      researchAck: d.researchAck,
    });

    // Stock went down, so the static product pages need to know.
    revalidateStorefront();
    const settings = await getSettings();
    await sendOrderConfirmation(order, settings).catch((error) => console.error("[checkout] confirmation email failed", error));
    await sendNewOrderNotification(order, settings).catch((error) => console.error("[checkout] new-order notice failed", error));

    return { ok: true, number: order.number, token: order.accessToken };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message };
    console.error("[checkout] failed", error);
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }
}
