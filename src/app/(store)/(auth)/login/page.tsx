import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading, LoginForm } from "@/components/account/auth-forms";
import { redirectIfSignedIn } from "../guard";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  await redirectIfSignedIn(next);
  return (
    <>
      <AuthHeading
        title="Welcome back"
        subtitle={
          <>
            New to GLP Research?{" "}
            <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-mint-700 hover:underline">
              Create an account
            </Link>
          </>
        }
      />
      <LoginForm next={next} />
      {next === "/checkout" ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Prefer not to sign in?{" "}
          <Link href="/checkout?guest=1" className="font-semibold text-ink-800 hover:underline">
            Continue as guest
          </Link>
        </p>
      ) : null}
    </>
  );
}
