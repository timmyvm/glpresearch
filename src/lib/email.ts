import "server-only";
import { db } from "./db";

type Email = { to: string; subject: string; text: string };

/**
 * Sends a transactional email through Resend when RESEND_API_KEY is set.
 * Every email is also written to the EmailLog table so admins can see what customers received.
 */
export async function sendEmail({ to, subject, text }: Email) {
  const key = process.env.RESEND_API_KEY;
  let status = "LOGGED";

  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "GLP Research <onboarding@resend.dev>",
          to,
          subject,
          text,
        }),
      });
      status = res.ok ? "SENT" : "FAILED";
    } catch {
      status = "FAILED";
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.info(`\n[email] → ${to}\n[email] ${subject}\n${text}\n`);
  }

  await db.emailLog.create({ data: { to, subject, body: text, status } }).catch(() => {});
  return status;
}
