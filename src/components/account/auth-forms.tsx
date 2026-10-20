"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { forgotPassword, login, register, resetPassword } from "@/app/(store)/(auth)/actions";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "./form-helpers";

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 hover:text-ink-700"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useFormAction(login);
  const fe = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fe.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!fe.password} />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-mint-700 hover:underline">
          Forgot your password?
        </Link>
      </div>
      <PendingButton pending={pending} pendingText="Signing in…" size="lg" className="w-full">
        Sign in
      </PendingButton>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useFormAction(register);
  const fe = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={fe.firstName}>
          <Input id="firstName" name="firstName" autoComplete="given-name" required aria-invalid={!!fe.firstName} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
          <Input id="lastName" name="lastName" autoComplete="family-name" required aria-invalid={!!fe.lastName} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fe.email} />
      </Field>
      <Field label="Institution or company" htmlFor="institution" hint="Optional" error={fe.institution}>
        <Input id="institution" name="institution" autoComplete="organization" placeholder="e.g. University laboratory" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" error={fe.password} hint="8+ characters with a letter and a number">
          <PasswordInput id="password" name="password" autoComplete="new-password" required aria-invalid={!!fe.password} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={fe.confirmPassword}>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required aria-invalid={!!fe.confirmPassword} />
        </Field>
      </div>
      <div className="space-y-3 rounded-xl bg-ink-50/70 p-4">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <Checkbox name="agree" className="mt-0.5" aria-invalid={!!fe.agree} />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-mint-700 hover:underline" target="_blank">
              Terms of Sale
            </Link>{" "}
            and{" "}
            <Link href="/disclaimer" className="font-medium text-mint-700 hover:underline" target="_blank">
              Research Use Policy
            </Link>
            , and confirm I am 18 or older.
          </span>
        </label>
        {fe.agree ? <p className="pl-7 text-xs text-rose-600">{fe.agree[0]}</p> : null}
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <Checkbox name="marketingOptIn" className="mt-0.5" />
          <span>Email me about new compounds, batch releases and research reviews.</span>
        </label>
      </div>
      <PendingButton pending={pending} pendingText="Creating account…" size="lg" className="w-full">
        Create account
      </PendingButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { state, pending, onSubmit } = useFormAction(forgotPassword);
  const fe = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl bg-mint-50 p-4 text-sm text-mint-900 ring-1 ring-mint-200">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-mint-600" />
          <p>{state.message}</p>
        </div>
        <Link href="/login" className="inline-block text-sm font-semibold text-mint-700 hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fe.email} />
      </Field>
      <PendingButton pending={pending} pendingText="Sending…" size="lg" className="w-full">
        Send reset link
      </PendingButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { state, pending, onSubmit } = useFormAction(resetPassword);
  const fe = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      {fe.token ? <p className="text-sm text-rose-600">{fe.token[0]}</p> : null}
      <Field label="New password" htmlFor="password" error={fe.password} hint="8+ characters with a letter and a number">
        <PasswordInput id="password" name="password" autoComplete="new-password" required aria-invalid={!!fe.password} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={fe.confirmPassword}>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required aria-invalid={!!fe.confirmPassword} />
      </Field>
      <PendingButton pending={pending} pendingText="Saving…" size="lg" className="w-full">
        Set new password
      </PendingButton>
    </form>
  );
}
