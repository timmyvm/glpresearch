import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";
import { HINT_COOKIE, hintValue } from "./session-hint";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function startSession(user: {
  id: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const token = await signSession({
    sub: user.id,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
  });
  const jar = await cookies();
  const options = { sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE } as const;
  jar.set(SESSION_COOKIE, token, { ...options, httpOnly: true });
  // Display-only copy for the static header; see session-hint.ts.
  jar.set(HINT_COOKIE, hintValue({ name: user.firstName, admin: user.role === "ADMIN" }), options);
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(HINT_COOKIE);
}

export const getSession = cache(async () => {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
});

/** The signed-in user, re-read from the database so role/suspension changes apply immediately. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      institution: true,
      role: true,
      status: true,
      marketingOptIn: true,
      createdAt: true,
    },
  });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
