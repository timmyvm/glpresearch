import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading, ForgotPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        title="Reset your password"
        subtitle={
          <>
            Enter the email on your account and we&apos;ll send a link to choose a new password.{" "}
            <Link href="/login" className="link text-ink">
              Back to sign in
            </Link>
            .
          </>
        }
      />
      <ForgotPasswordForm />
    </>
  );
}
