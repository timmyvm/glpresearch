"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, requireUser, startSession, verifyPassword } from "@/lib/auth";
import { bool, str, zodErrors, type ActionState } from "@/lib/actions";
import { AU_STATES } from "@/components/checkout/au-states";

const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().max(40).optional(),
  firstName: z.string().min(1, "Required").max(60),
  lastName: z.string().min(1, "Required").max(60),
  company: z.string().max(120).optional(),
  line1: z.string().min(3, "Enter a street address").max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2, "Enter a suburb or city").max(80),
  state: z.enum(AU_STATES.map((s) => s.code) as [string, ...string[]], { error: "Choose a state" }),
  postcode: z.string().regex(/^\d{4}$/, "Enter a 4-digit postcode"),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean(),
});

const opt = (form: FormData, key: string) => str(form, key) || undefined;

export async function saveAddress(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/account/addresses");
  const parsed = addressSchema.safeParse({
    id: opt(form, "id"),
    label: opt(form, "label"),
    firstName: str(form, "firstName"),
    lastName: str(form, "lastName"),
    company: opt(form, "company"),
    line1: str(form, "line1"),
    line2: opt(form, "line2"),
    city: str(form, "city"),
    state: str(form, "state"),
    postcode: str(form, "postcode"),
    phone: opt(form, "phone"),
    isDefault: bool(form, "isDefault"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const { id, ...data } = parsed.data;
  const fields = {
    ...data,
    label: data.label ?? null,
    company: data.company ?? null,
    line2: data.line2 ?? null,
    phone: data.phone ?? null,
    country: "Australia",
  };

  if (id) {
    const existing = await db.address.findFirst({ where: { id, userId: user.id } });
    if (!existing) return { error: "Address not found." };
  }
  const defaults = await db.address.count({ where: { userId: user.id, isDefault: true, ...(id ? { NOT: { id } } : {}) } });
  const makeDefault = fields.isDefault || defaults === 0;

  await db.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    if (id) await tx.address.update({ where: { id }, data: { ...fields, isDefault: makeDefault } });
    else await tx.address.create({ data: { ...fields, isDefault: makeDefault, userId: user.id } });
  });

  revalidatePath("/account/addresses");
  return { ok: true, message: id ? "Address updated." : "Address added." };
}

export async function deleteAddress(form: FormData) {
  const user = await requireUser("/account/addresses");
  const id = str(form, "id");
  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return;
  await db.address.delete({ where: { id } });
  if (address.isDefault) {
    const next = await db.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(form: FormData) {
  const user = await requireUser("/account/addresses");
  const id = str(form, "id");
  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}

const profileSchema = z.object({
  firstName: z.string().min(1, "Required").max(60),
  lastName: z.string().min(1, "Required").max(60),
  phone: z.string().max(30).optional(),
  institution: z.string().max(160).optional(),
  marketingOptIn: z.boolean(),
});

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/account/settings");
  const parsed = profileSchema.safeParse({
    firstName: str(form, "firstName"),
    lastName: str(form, "lastName"),
    phone: opt(form, "phone"),
    institution: opt(form, "institution"),
    marketingOptIn: bool(form, "marketingOptIn"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;
  const updated = await db.user.update({
    where: { id: user.id },
    data: { firstName: d.firstName, lastName: d.lastName, phone: d.phone ?? null, institution: d.institution ?? null, marketingOptIn: d.marketingOptIn },
  });
  if (d.marketingOptIn) {
    await db.subscriber.upsert({ where: { email: updated.email }, update: {}, create: { email: updated.email } });
  } else {
    await db.subscriber.deleteMany({ where: { email: updated.email } });
  }
  await startSession(updated); // refresh the name stored in the session cookie
  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile saved." };
}

const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/account/settings");
  const parsed = z
    .object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword, confirmPassword: z.string() })
    .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" })
    .safeParse({
      currentPassword: str(form, "currentPassword"),
      newPassword: str(form, "newPassword"),
      confirmPassword: str(form, "confirmPassword"),
    });
  if (!parsed.success) return zodErrors(parsed.error);

  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return { error: "Your current password is incorrect.", fieldErrors: { currentPassword: ["Incorrect password"] } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return { ok: true, message: "Password updated." };
}

export async function changeEmail(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/account/settings");
  const parsed = z
    .object({ email: z.email("Enter a valid email address").max(200), password: z.string().min(1, "Enter your password") })
    .safeParse({ email: str(form, "email").toLowerCase(), password: str(form, "password") });
  if (!parsed.success) return zodErrors(parsed.error);
  if (parsed.data.email === user.email) return { error: "That's already your email address." };

  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.password, record.passwordHash))) {
    return { error: "Your password is incorrect.", fieldErrors: { password: ["Incorrect password"] } };
  }
  const taken = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (taken) return { error: "That email is already used by another account.", fieldErrors: { email: ["Already in use"] } };

  const updated = await db.user.update({ where: { id: user.id }, data: { email: parsed.data.email } });
  await db.subscriber.updateMany({ where: { email: user.email }, data: { email: updated.email } }).catch(() => {});
  await startSession(updated);
  revalidatePath("/account", "layout");
  return { ok: true, message: `Email changed to ${updated.email}.` };
}

/**
 * Closes the signed-in account. Orders are kept for the store's records, but the account's name,
 * contact details, addresses and reset links are removed and its email is released for reuse.
 */
export async function closeAccount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser("/account/settings");
  const parsed = z
    .object({ password: z.string().min(1, "Enter your password"), confirmEmail: z.string() })
    .refine((d) => d.confirmEmail.trim().toLowerCase() === user.email, {
      path: ["confirmEmail"],
      message: "Type your email address exactly as shown",
    })
    .safeParse({ password: str(form, "password"), confirmEmail: str(form, "confirmEmail") });
  if (!parsed.success) return zodErrors(parsed.error);
  if (user.role === "ADMIN") return { error: "Store administrator accounts can't be closed here. Ask another administrator." };

  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.password, record.passwordHash))) {
    return { error: "Your password is incorrect.", fieldErrors: { password: ["Incorrect password"] } };
  }

  await db.$transaction([
    db.address.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    db.subscriber.deleteMany({ where: { email: user.email } }),
    db.stockAlert.deleteMany({ where: { email: user.email } }),
    db.user.update({
      where: { id: user.id },
      data: {
        status: "CLOSED",
        firstName: "Closed",
        lastName: "account",
        email: `closed+${user.id}@invalid.local`,
        phone: null,
        institution: null,
        marketingOptIn: false,
        passwordHash: await hashPassword(crypto.randomUUID()),
      },
    }),
  ]);
  await endSession();
  redirect("/?account=closed");
}
