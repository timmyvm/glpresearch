import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading, RegisterForm } from "@/components/account/auth-forms";
import { redirectIfSignedIn } from "../guard";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  await redirectIfSignedIn(next);
  return (
    <>
      <AuthHeading
        title="Create an account"
        subtitle={
          <>
            Save lab addresses, follow every order and reorder in one step. Already registered?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="link text-ink">
              Sign in
            </Link>
            .
          </>
        }
      />
      <RegisterForm next={next} />
    </>
  );
}
