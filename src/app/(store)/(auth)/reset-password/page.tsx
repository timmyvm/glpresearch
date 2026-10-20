import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { Alert } from "@/components/ui/alert";
import { AuthHeading, ResetPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const record = token
    ? await db.passwordResetToken.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") } })
    : null;
  const valid = !!record && !record.usedAt && record.expiresAt > new Date();

  return (
    <>
      <AuthHeading title="Choose a new password" subtitle="Use at least 8 characters with a letter and a number." />
      {valid && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-6">
          <Alert tone="error" title="This reset link is invalid or has expired">
            Reset links work once and expire after 1 hour. Request a new one to continue.
          </Alert>
          <Link href="/forgot-password" className="link inline-block font-medium">
            Request a new link
          </Link>
        </div>
      )}
    </>
  );
}
