import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

/**
 * Emails everyone waiting on a variant once it has stock again, and marks their alerts sent.
 * Safe to call after any stock write: it does nothing while the variant is out of stock or inactive.
 */
export async function notifyBackInStock(variantId: string) {
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { name: true, slug: true, active: true } } },
  });
  if (!variant || variant.stock <= 0 || !variant.active || !variant.product.active) return 0;

  const waiting = await db.stockAlert.findMany({ where: { variantId, notifiedAt: null } });
  if (!waiting.length) return 0;

  const settings = await getSettings();
  const subject = `${variant.product.name} ${variant.label} is back in stock`;
  const link = siteUrl(`/shop/${variant.product.slug}`);
  for (const alert of waiting) {
    await sendEmail({
      to: alert.email,
      subject,
      text: [
        "Hello,",
        "",
        `${variant.product.name} ${variant.label} is back in stock. You asked us to let you know.`,
        "",
        `Order it here: ${link}`,
        "",
        "Stock is limited and is not reserved by this email.",
        "",
        `— The ${settings.storeName} team`,
      ].join("\n"),
    });
  }
  await db.stockAlert.updateMany({ where: { id: { in: waiting.map((a) => a.id) } }, data: { notifiedAt: new Date() } });
  return waiting.length;
}
