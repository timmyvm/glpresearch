"use server";

import { revalidateStorefront } from "@/lib/revalidate";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { saveSettings, type StoreSettings } from "@/lib/settings";
import { toCents } from "@/lib/money";
import { str, zodErrors, type ActionState } from "@/lib/actions";

const money = z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 12.95");

const schema = z.object({
  storeName: z.string().min(2).max(80),
  supportEmail: z.email("Enter a valid email"),
  supportPhone: z.string().max(40),
  announcement: z.string().max(200),
  orderPrefix: z.string().min(2).max(8).regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
  shippingStandard: money,
  shippingExpress: money,
  freeShippingThreshold: money,
  bankAccountName: z.string().max(120),
  bankBsb: z.string().max(20),
  bankAccountNumber: z.string().max(30),
  payId: z.string().max(120),
  cryptoBtcAddress: z.string().max(120),
  cryptoUsdtAddress: z.string().max(120),
  paymentWindowHours: z.coerce.number().int().min(1).max(720),
  dispatchCutoff: z.string().max(200),
});

export async function updateSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(form, k)]));
  raw.orderPrefix = (raw.orderPrefix ?? "").toUpperCase();
  raw.supportEmail = (raw.supportEmail ?? "").toLowerCase();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return zodErrors(parsed.error);

  const d = parsed.data;
  const values: StoreSettings = {
    ...d,
    shippingStandard: toCents(d.shippingStandard),
    shippingExpress: toCents(d.shippingExpress),
    freeShippingThreshold: toCents(d.freeShippingThreshold),
  };
  await saveSettings(values);
  revalidateStorefront();
  return { ok: true, message: "Settings saved. Changes are live on the store." };
}
