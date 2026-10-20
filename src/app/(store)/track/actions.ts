"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { str, zodErrors, type ActionState } from "@/lib/actions";

const schema = z.object({
  number: z.string().trim().min(3, "Enter your order number").max(40),
  email: z.email("Enter the email used at checkout"),
});

export async function trackOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({ number: str(form, "number").toUpperCase(), email: str(form, "email").toLowerCase() });
  if (!parsed.success) return zodErrors(parsed.error);

  const raw = parsed.data.number.replace(/\s+/g, "");
  const candidates = /^\d+$/.test(raw) ? [raw, `GLP-${raw}`] : [raw];
  const order = await db.order.findFirst({
    where: { number: { in: candidates } },
    select: { number: true, email: true, accessToken: true },
  });
  if (!order || order.email.toLowerCase() !== parsed.data.email) {
    return { error: "We couldn't find an order matching those details. Check the order number and email and try again." };
  }
  redirect(`/order/${order.number}?token=${order.accessToken}`);
}
