"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, login, register, resetPassword } from "@/app/(store)/(auth)/actions";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "./form-helpers";

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-12" spellCheck={false} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="press absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h1 className="text-head">{title}</h1>
      <p className="mt-4 max-w-[42ch] text-muted">{subtitle}</p>
    </div>
  );
}

/** A checkbox whose label and control share one hit target. */
function CheckRow({ name, invalid, children }: { name: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2 text-small leading-relaxed text-ink">
      <Checkbox name={name} className="mt-0.5" aria-invalid={invalid || undefined} />
      <span>{children}</span>
    </label>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit, ref } = useFormAction(login);
  const fe = state.fieldErrors ?? {};
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@institution.edu…" required aria-invalid={!!fe.email || undefined} />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!fe.password || undefined} />
      </Field>
      <div className="flex items-center justify-between gap-4 pt-1">
        <PendingButton pending={pending} pendingText="Signing in…" size="lg">
          Sign In
        </PendingButton>
        <Link href="/forgot-password" className="link text-small text-muted hover:text-ink">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const { state, pending, onSubmit, ref } = useFormAction(register);
  const fe = state.fieldErrors ?? {};
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={fe.firstName}>
          <Input id="firstName" name="firstName" autoComplete="given-name" required aria-invalid={!!fe.firstName || undefined} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
          <Input id="lastName" name="lastName" autoComplete="family-name" required aria-invalid={!!fe.lastName || undefined} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@institution.edu…" required aria-invalid={!!fe.email || undefined} />
      </Field>
      <Field label="Institution or company (optional)" htmlFor="institution" error={fe.institution}>
        <Input id="institution" name="institution" autoComplete="organization" placeholder="e.g. University peptide lab…" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={fe.password} hint="8+ characters with a letter and a number">
          <PasswordInput id="password" name="password" autoComplete="new-password" required aria-invalid={!!fe.password || undefined} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={fe.confirmPassword}>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required aria-invalid={!!fe.confirmPassword || undefined} />
        </Field>
      </div>
      <div className="bg-surface px-4 py-2">
        <CheckRow name="agree" invalid={!!fe.agree}>
          I agree to the{" "}
          <Link href="/terms" className="link" target="_blank">
            Terms of Sale
          </Link>{" "}
          and{" "}
          <Link href="/disclaimer" className="link" target="_blank">
            Research Use Policy
          </Link>
          , and confirm I am 18 or older.
        </CheckRow>
        {fe.agree ? (
          <p className="pb-2 pl-8 text-small text-danger" role="alert">
            {fe.agree[0]}
          </p>
        ) : null}
        <CheckRow name="marketingOptIn">Email me about new compounds, batch releases and literature reviews.</CheckRow>
      </div>
      <PendingButton pending={pending} pendingText="Creating account…" size="lg">
        Create Account
      </PendingButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { state, pending, onSubmit, ref } = useFormAction(forgotPassword);
  const fe = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <div className="space-y-6" role="status">
        <p className="bg-surface p-5 text-ink">{state.message}</p>
        <Link href="/login" className="link inline-block font-medium">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@institution.edu…" required aria-invalid={!!fe.email || undefined} />
      </Field>
      <PendingButton pending={pending} pendingText="Sending…" size="lg">
        Send Reset Link
      </PendingButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { state, pending, onSubmit, ref } = useFormAction(resetPassword);
  const fe = state.fieldErrors ?? {};
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      {fe.token ? (
        <p className="text-small text-danger" role="alert">
          {fe.token[0]}
        </p>
      ) : null}
      <Field label="New password" htmlFor="password" error={fe.password} hint="8+ characters with a letter and a number">
        <PasswordInput id="password" name="password" autoComplete="new-password" required aria-invalid={!!fe.password || undefined} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={fe.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required aria-invalid={!!fe.confirmPassword || undefined} />
      </Field>
      <PendingButton pending={pending} pendingText="Saving…" size="lg">
        Save New Password
      </PendingButton>
    </form>
  );
}
