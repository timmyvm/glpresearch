"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { bool, optStr, str, zodErrors, type ActionState } from "@/lib/actions";
import { parseDateInput } from "@/lib/admin/format";

const schema = z
  .object({
    code: z
      .string()
      .min(3, "At least 3 characters")
      .max(32)
      .regex(/^[A-Z0-9_-]+$/, "Letters, numbers, dashes and underscores only"),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive("Must be greater than 0"),
    minSubtotal: z.coerce.number().min(0),
    maxUses: z.coerce.number().int().positive().nullable(),
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, { message: "Percent can't exceed 100", path: ["value"] });

export async function saveCoupon(couponId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    code: str(form, "code").toUpperCase(),
    type: str(form, "type"),
    value: str(form, "value"),
    minSubtotal: str(form, "minSubtotal") || "0",
    maxUses: str(form, "maxUses") || null,
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const startsAt = parseDateInput(str(form, "startsAt"));
  const expiresAt = parseDateInput(str(form, "expiresAt"));
  if (startsAt && expiresAt && expiresAt <= startsAt) return { error: "Expiry must be after the start date." };

  const taken = await db.coupon.findFirst({ where: { code: d.code, NOT: couponId ? { id: couponId } : undefined }, select: { id: true } });
  if (taken) return { error: `Code ${d.code} already exists.`, fieldErrors: { code: ["Already exists"] } };

  const data = {
    code: d.code,
    description: optStr(form, "description"),
    type: d.type,
    value: d.type === "PERCENT" ? Math.round(d.value) : toCents(String(d.value)),
    minSubtotal: toCents(String(d.minSubtotal)),
    maxUses: d.maxUses,
    startsAt,
    // Inclusive expiry: valid until the end of the chosen day.
    expiresAt: expiresAt ? new Date(expiresAt.getTime() + 86399999) : null,
    active: bool(form, "active"),
  };

  if (couponId) await db.coupon.update({ where: { id: couponId }, data });
  else await db.coupon.create({ data });

  revalidatePath("/admin/coupons");
  redirect(`/admin/coupons?saved=${d.code}`);
}

export async function toggleCoupon(couponId: string) {
  await requireAdmin();
  const c = await db.coupon.findUnique({ where: { id: couponId }, select: { active: true } });
  if (!c) return;
  await db.coupon.update({ where: { id: couponId }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();
  await db.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
