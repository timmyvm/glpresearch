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
        title="Create your account"
        subtitle={
          <>
            Already registered?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-mint-700 hover:underline">
              Sign in
            </Link>
          </>
        }
      />
      <RegisterForm next={next} />
    </>
  );
}
