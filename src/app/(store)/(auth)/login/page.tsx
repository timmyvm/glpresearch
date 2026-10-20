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
        title="Sign in to your account"
        subtitle={
          <>
            Track orders, see payment details and reorder. New here?{" "}
            <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="link text-ink">
              Create an account
            </Link>
            .
          </>
        }
      />
      <LoginForm next={next} />
      {next === "/checkout" ? (
        <p className="mt-10 text-muted">
          Prefer not to sign in?{" "}
          <Link href="/checkout?guest=1" className="link text-ink">
            Check out as a guest
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
