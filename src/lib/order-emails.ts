import "server-only";
import { sendEmail } from "./email";
import { formatMoney } from "./money";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "./orders";
import type { StoreSettings } from "./settings";
import { siteUrl } from "./utils";

type EmailOrder = {
  number: string;
  accessToken: string;
  email: string;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  shipFirstName: string;
  shipLastName: string;
  shipCompany: string | null;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPostcode: string;
  shipCountry: string;
  items: { productName: string; variantLabel: string; sku: string; quantity: number; lineTotal: number }[];
};

export function orderUrl(order: { number: string; accessToken: string }) {
  return siteUrl(`/order/${order.number}?token=${order.accessToken}`);
}

/** Plain-text payment instructions shared by emails. */
export function paymentInstructionsText(order: { number: string; total: number; paymentMethod: string }, settings: StoreSettings) {
  const lines: string[] = [];
  const due = formatMoney(order.total);
  if (order.paymentMethod === "BANK_TRANSFER") {
    lines.push(
      `Please transfer ${due} to:`,
      `  Account name: ${settings.bankAccountName}`,
      `  BSB: ${settings.bankBsb}`,
      `  Account number: ${settings.bankAccountNumber}`,
    );
  } else if (order.paymentMethod === "PAYID") {
    lines.push(`Please pay ${due} by PayID / Osko to:`, `  PayID: ${settings.payId}`, `  Name: ${settings.bankAccountName}`);
  } else {
    lines.push(`Please pay the equivalent of ${due} in cryptocurrency.`);
    if (settings.cryptoBtcAddress) lines.push(`  BTC: ${settings.cryptoBtcAddress}`);
    if (settings.cryptoUsdtAddress) lines.push(`  USDT: ${settings.cryptoUsdtAddress}`);
    if (!settings.cryptoBtcAddress && !settings.cryptoUsdtAddress) {
      lines.push("  Our team will email you the wallet address and exact amount shortly.");
    }
  }
  lines.push(
    `  Payment reference: ${order.number}`,
    "",
    `Please include your order number as the reference. Unpaid orders are cancelled after ${settings.paymentWindowHours} hours.`,
  );
  return lines.join("\n");
}

export async function sendOrderConfirmation(order: EmailOrder, settings: StoreSettings) {
  const payment = PAYMENT_METHODS[order.paymentMethod as PaymentMethod]?.label ?? order.paymentMethod;
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  const text = [
    `Hi ${order.shipFirstName},`,
    "",
    `Thanks for your order with ${settings.storeName}. Your order number is ${order.number}.`,
    "",
    "ORDER SUMMARY",
    ...order.items.map((i) => `  ${i.quantity} × ${i.productName} ${i.variantLabel} (${i.sku}) — ${formatMoney(i.lineTotal)}`),
    "",
    `  Subtotal: ${formatMoney(order.subtotal)}`,
    ...(order.discount ? [`  Discount${order.couponCode ? ` (${order.couponCode})` : ""}: −${formatMoney(order.discount)}`] : []),
    `  Shipping (${shipping?.label ?? order.shippingMethod}): ${order.shipping ? formatMoney(order.shipping) : "Free"}`,
    `  Total: ${formatMoney(order.total)}`,
    "",
    `PAYMENT — ${payment.toUpperCase()}`,
    paymentInstructionsText(order, settings),
    "",
    "SHIPPING TO",
    `  ${order.shipFirstName} ${order.shipLastName}`,
    ...(order.shipCompany ? [`  ${order.shipCompany}`] : []),
    `  ${order.shipLine1}`,
    ...(order.shipLine2 ? [`  ${order.shipLine2}`] : []),
    `  ${order.shipCity} ${order.shipState} ${order.shipPostcode}`,
    `  ${order.shipCountry}`,
    "",
    `View your order and its status at any time:`,
    orderUrl(order),
    "",
    `${settings.dispatchCutoff}. You'll receive a tracking number as soon as your order ships.`,
    "",
    "All products are supplied strictly for laboratory research use only.",
    "",
    `— The ${settings.storeName} team`,
    settings.supportEmail,
  ].join("\n");

  return sendEmail({ to: order.email, subject: `Order ${order.number} received — payment instructions`, text });
}
