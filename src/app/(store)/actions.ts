"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { str, zodErrors, type ActionState } from "@/lib/actions";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function subscribe(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z.object({ email: z.email("Enter a valid email") }).safeParse({ email: str(form, "email").toLowerCase() });
  if (!parsed.success) return { error: "Enter a valid email address." };
  await db.subscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: { email: parsed.data.email } });
  return { ok: true, message: "You're subscribed. Thanks!" };
}

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name").max(120),
  email: z.email("Enter a valid email"),
  subject: z.string().min(2, "Choose a subject").max(160),
  orderNumber: z.string().max(40).optional(),
  message: z.string().min(10, "Tell us a little more (10+ characters)").max(5000),
});

export async function sendContactMessage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: str(form, "name"),
    email: str(form, "email").toLowerCase(),
    subject: str(form, "subject"),
    orderNumber: str(form, "orderNumber") || undefined,
    message: str(form, "message"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  if (!(await rateLimit("contact", await clientIp(), 5, 3600))) {
    return { error: "You've sent several messages in the last hour. Please wait a while, or email us directly." };
  }
  await db.contactMessage.create({ data: parsed.data });
  return { ok: true, message: "Thanks, your message has been received. We reply within one business day." };
}

export async function requestStockAlert(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({ email: z.email("Enter a valid email"), variantId: z.string().min(1).max(64) })
    .safeParse({ email: str(form, "email").toLowerCase(), variantId: str(form, "variantId") });
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!(await rateLimit("stock-alert", await clientIp(), 10, 3600))) {
    return { error: "Too many requests from this connection. Try again in an hour." };
  }
  const variant = await db.productVariant.findFirst({
    where: { id: parsed.data.variantId, active: true, product: { active: true } },
    select: { id: true },
  });
  if (!variant) return { error: "That vial size is no longer available." };
  await db.stockAlert.upsert({
    where: { email_variantId: { email: parsed.data.email, variantId: variant.id } },
    update: { notifiedAt: null },
    create: { email: parsed.data.email, variantId: variant.id },
  });
  return { ok: true, message: "We'll email you when it's back." };
}
