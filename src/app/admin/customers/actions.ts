"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import { str, type ActionState } from "@/lib/actions";

function revalidateCustomer(id: string) {
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
}

export async function saveCustomerNotes(userId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { adminNotes: str(form, "adminNotes").slice(0, 4000) || null } });
  revalidateCustomer(userId);
  return { ok: true, message: "Notes saved." };
}

export async function setCustomerStatus(userId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const status = str(form, "status") === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
  if (userId === admin.id && status === "SUSPENDED") return { error: "You can't suspend your own account." };
  await db.user.update({ where: { id: userId }, data: { status } });
  revalidateCustomer(userId);
  return { ok: true, message: status === "SUSPENDED" ? "Account suspended — they can no longer sign in." : "Account reactivated." };
}

export async function setCustomerRole(userId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const role = str(form, "role") === "ADMIN" ? "ADMIN" : "CUSTOMER";
  if (userId === admin.id && role !== "ADMIN") return { error: "You can't remove your own admin access." };
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidateCustomer(userId);
  return { ok: true, message: role === "ADMIN" ? "Promoted to admin." : "Admin access removed." };
}

export async function sendPasswordReset(userId: string): Promise<ActionState> {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Customer not found." };

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const settings = await getSettings();
  const link = siteUrl(`/reset-password?token=${token}`);
  await sendEmail({
    to: user.email,
    subject: `Reset your ${settings.storeName} password`,
    text: [
      `Hi ${user.firstName},`,
      "",
      "A password reset was requested for your account. Use the link below to choose a new password. It expires in 1 hour.",
      "",
      link,
      "",
      "If you didn't request this, you can ignore this email.",
      "",
      `— The ${settings.storeName} team`,
    ].join("\n"),
  });

  return { ok: true, message: `Reset link emailed to ${user.email} (valid for 1 hour).` };
}
