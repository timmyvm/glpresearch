"use client";

import { useEffect, useRef } from "react";
import { changeEmail, changePassword, updateProfile } from "@/app/(store)/account/actions";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "./form-helpers";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  institution: string | null;
  marketingOptIn: boolean;
};

export function ProfileForm({ user }: { user: Profile }) {
  const { state, pending, onSubmit } = useFormAction(updateProfile);
  const fe = state.fieldErrors ?? {};
  return (
    <Card>
      <CardHeader title="Profile" description="Your name and contact details." />
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormMessage state={state} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName" error={fe.firstName}>
              <Input id="firstName" name="firstName" defaultValue={user.firstName} autoComplete="given-name" aria-invalid={!!fe.firstName} />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
              <Input id="lastName" name="lastName" defaultValue={user.lastName} autoComplete="family-name" aria-invalid={!!fe.lastName} />
            </Field>
            <Field label="Phone" htmlFor="phone" hint="Optional" error={fe.phone}>
              <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} autoComplete="tel" />
            </Field>
            <Field label="Institution or company" htmlFor="institution" hint="Optional" error={fe.institution}>
              <Input id="institution" name="institution" defaultValue={user.institution ?? ""} autoComplete="organization" />
            </Field>
          </div>
          <label className="flex items-start gap-2.5 text-sm text-slate-700">
            <Checkbox name="marketingOptIn" defaultChecked={user.marketingOptIn} className="mt-0.5" />
            Email me about new compounds, batch releases and research reviews.
          </label>
          <div className="flex justify-end">
            <PendingButton pending={pending} pendingText="Saving…">
              Save profile
            </PendingButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function EmailForm({ email }: { email: string }) {
  const { state, pending, onSubmit } = useFormAction(changeEmail);
  const fe = state.fieldErrors ?? {};
  return (
    <Card>
      <CardHeader title="Email address" description={<>Currently <span className="font-medium text-ink-800">{email}</span></>} />
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormMessage state={state} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New email" htmlFor="newEmail" error={fe.email}>
              <Input id="newEmail" name="email" type="email" autoComplete="email" aria-invalid={!!fe.email} />
            </Field>
            <Field label="Current password" htmlFor="emailPassword" error={fe.password}>
              <Input id="emailPassword" name="password" type="password" autoComplete="current-password" aria-invalid={!!fe.password} />
            </Field>
          </div>
          <div className="flex justify-end">
            <PendingButton pending={pending} pendingText="Updating…" variant="outline">
              Change email
            </PendingButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit } = useFormAction(changePassword);
  const formRef = useRef<HTMLFormElement>(null);
  const fe = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  return (
    <Card>
      <CardHeader title="Password" description="Use at least 8 characters with a letter and a number." />
      <CardBody>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormMessage state={state} />
          <Field label="Current password" htmlFor="currentPassword" error={fe.currentPassword}>
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!fe.currentPassword} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" htmlFor="newPassword" error={fe.newPassword}>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.newPassword} />
            </Field>
            <Field label="Confirm new password" htmlFor="confirmPassword" error={fe.confirmPassword}>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.confirmPassword} />
            </Field>
          </div>
          <div className="flex justify-end">
            <PendingButton pending={pending} pendingText="Updating…" variant="outline">
              Update password
            </PendingButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
