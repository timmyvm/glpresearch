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
      <AuthHeading title="Choose a new password" subtitle="Pick something you haven't used here before." />
      {valid && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-5">
          <Alert tone="error" title="This reset link is invalid or has expired">
            Reset links can only be used once and expire after 1 hour.
          </Alert>
          <Link href="/forgot-password" className="inline-block text-sm font-semibold text-mint-700 hover:underline">
            Request a new link →
          </Link>
        </div>
      )}
    </>
  );
}
