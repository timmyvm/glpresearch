"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import { bool, str, zodErrors, type ActionState } from "@/lib/actions";
import { sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import { safeNext } from "./safe-next";

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Enter your first name").max(60),
    lastName: z.string().min(1, "Enter your last name").max(60),
    email: z.email("Enter a valid email address").max(200),
    password,
    confirmPassword: z.string(),
    institution: z.string().max(160).optional(),
    marketingOptIn: z.boolean(),
    agree: z.literal(true, { error: "You must agree to continue" }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export async function register(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    firstName: str(form, "firstName"),
    lastName: str(form, "lastName"),
    email: str(form, "email").toLowerCase(),
    password: str(form, "password"),
    confirmPassword: str(form, "confirmPassword"),
    institution: str(form, "institution") || undefined,
    marketingOptIn: bool(form, "marketingOptIn"),
    agree: bool(form, "agree"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const data = parsed.data;

  if (!(await rateLimit("register", await clientIp(), 5, 60 * 60))) {
    return { error: "Too many accounts have been created from this connection. Please try again in an hour." };
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "An account with this email already exists.", fieldErrors: { email: ["Already registered — try signing in"] } };
  }

  const user = await db.user.create({
    data: {
      email: data.email,
      passwordHash: await hashPassword(data.password),
      firstName: data.firstName,
      lastName: data.lastName,
      institution: data.institution ?? null,
      marketingOptIn: data.marketingOptIn,
      lastLoginAt: new Date(),
    },
  });
  if (data.marketingOptIn) {
    await db.subscriber.upsert({ where: { email: user.email }, update: {}, create: { email: user.email } });
  }

  const settings = await getSettings();
  await sendEmail({
    to: user.email,
    subject: `Welcome to ${settings.storeName}`,
    text: [
      `Hi ${user.firstName},`,
      "",
      `Your ${settings.storeName} account is ready. From your account you can track orders, view payment instructions, manage saved addresses and reorder in a couple of clicks.`,
      "",
      `Sign in any time: ${siteUrl("/login")}`,
      `Browse the research library: ${siteUrl("/research")}`,
      "",
      "All products are supplied strictly for laboratory research use only.",
      "",
      `— The ${settings.storeName} team`,
    ].join("\n"),
  });

  await startSession(user);
  redirect(safeNext(str(form, "next"), "/account"));
}

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: str(form, "email").toLowerCase(), password: str(form, "password") });
  if (!parsed.success) return zodErrors(parsed.error);

  if (!(await rateLimit("login", `${parsed.data.email}|${await clientIp()}`, 10, 15 * 60))) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes, or reset your password." };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Incorrect email or password. Check both and try again." };
  }
  if (user.status === "SUSPENDED") {
    return { error: "This account is suspended. Contact support if you think this is a mistake." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "This account has been closed. Create a new account to order again." };
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession(user);
  redirect(safeNext(str(form, "next"), user.role === "ADMIN" ? "/admin" : "/account"));
}

export async function logout() {
  await endSession();
  redirect("/");
}

const RESET_MESSAGE = "If an account exists for that email, we've sent a link to reset your password. It expires in 1 hour.";

export async function forgotPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z.object({ email: z.email("Enter a valid email address") }).safeParse({ email: str(form, "email").toLowerCase() });
  if (!parsed.success) return zodErrors(parsed.error);

  const ip = await clientIp();
  const allowed = (await rateLimit("forgot-ip", ip, 10, 60 * 60)) && (await rateLimit("forgot", parsed.data.email, 3, 60 * 60));
  if (!allowed) {
    return { error: "Too many reset requests. Please check your inbox for an earlier link, or try again in an hour." };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user && user.status === "ACTIVE") {
    const raw = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(raw).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const settings = await getSettings();
    await sendEmail({
      to: user.email,
      subject: `Reset your ${settings.storeName} password`,
      text: [
        `Hi ${user.firstName},`,
        "",
        "We received a request to reset your password. Use the link below to choose a new one — it expires in 1 hour.",
        "",
        siteUrl(`/reset-password?token=${raw}`),
        "",
        "If you didn't request this, you can safely ignore this email.",
        "",
        `— The ${settings.storeName} team`,
      ].join("\n"),
    });
  }
  return { ok: true, message: RESET_MESSAGE };
}

const resetSchema = z
  .object({ token: z.string().min(10, "This reset link is invalid."), password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export async function resetPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse({
    token: str(form, "token"),
    password: str(form, "password"),
    confirmPassword: str(form, "confirmPassword"),
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt < new Date() || record.user.status !== "ACTIVE") {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(parsed.data.password), lastLoginAt: new Date() } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: new Date() } }),
  ]);
  await startSession(record.user);
  redirect(record.user.role === "ADMIN" ? "/admin" : "/account");
}
