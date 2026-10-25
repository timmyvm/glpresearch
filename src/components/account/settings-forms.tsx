"use client";

import { useEffect, useState } from "react";
import { changeEmail, changePassword, closeAccount, updateProfile } from "@/app/(store)/account/actions";
import { Button } from "@/components/ui/button";
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

/** One settings area: its name and what it controls on the left, the fields on the right. */
export function SettingsSection({
  id,
  title,
  description,
  tone,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} data-ui className="grid gap-x-10 gap-y-4 border-t border-ink/10 py-8 first:border-t-0 first:pt-2 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div>
        <h2 id={id} className={tone === "danger" ? "text-lead font-semibold text-danger" : "text-lead font-semibold"}>
          {title}
        </h2>
        <div className="mt-1 max-w-[42ch] text-small text-muted">{description}</div>
      </div>
      <div className="max-w-2xl min-w-0">{children}</div>
    </section>
  );
}

export function ProfileForm({ user }: { user: Profile }) {
  const { state, pending, onSubmit, ref } = useFormAction(updateProfile);
  const fe = state.fieldErrors ?? {};
  return (
    <SettingsSection id="profile-title" title="Profile" description="The name on your orders and invoices, and how we reach you about them.">
      <form ref={ref} onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={fe.firstName}>
            <Input id="firstName" name="firstName" defaultValue={user.firstName} autoComplete="given-name" aria-invalid={!!fe.firstName} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
            <Input id="lastName" name="lastName" defaultValue={user.lastName} autoComplete="family-name" aria-invalid={!!fe.lastName} />
          </Field>
          <Field label="Phone (optional)" htmlFor="phone" error={fe.phone}>
            <Input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={user.phone ?? ""} autoComplete="tel" />
          </Field>
          <Field label="Institution or company (optional)" htmlFor="institution" error={fe.institution}>
            <Input id="institution" name="institution" defaultValue={user.institution ?? ""} autoComplete="organization" />
          </Field>
        </div>
        <label className="flex cursor-pointer items-start gap-3 py-1 text-small">
          <Checkbox name="marketingOptIn" defaultChecked={user.marketingOptIn} className="mt-0.5" />
          Email me about new compounds, batch releases and research reviews.
        </label>
        <div className="flex justify-end">
          <PendingButton pending={pending} pendingText="Saving…">
            Save Profile
          </PendingButton>
        </div>
      </form>
    </SettingsSection>
  );
}

export function EmailForm({ email }: { email: string }) {
  const { state, pending, onSubmit, ref } = useFormAction(changeEmail);
  const fe = state.fieldErrors ?? {};
  return (
    <SettingsSection
      id="email-title"
      title="Sign-in email"
      description={
        <>
          You sign in with <span className="text-ink [overflow-wrap:anywhere]">{email}</span>. Order emails go here too.
        </>
      }
    >
      <form ref={ref} onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New email" htmlFor="newEmail" error={fe.email}>
            <Input
              id="newEmail"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="you@lab.org…"
              aria-invalid={!!fe.email}
            />
          </Field>
          <Field label="Current password" htmlFor="emailPassword" error={fe.password}>
            <Input id="emailPassword" name="password" type="password" autoComplete="current-password" aria-invalid={!!fe.password} />
          </Field>
        </div>
        <div className="flex justify-end">
          <PendingButton pending={pending} pendingText="Changing…" variant="outline">
            Change Email
          </PendingButton>
        </div>
      </form>
    </SettingsSection>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit, ref } = useFormAction(changePassword);
  const fe = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state, ref]);
  return (
    <SettingsSection id="password-title" title="Password" description="At least 8 characters, with a letter and a number.">
      <form ref={ref} onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <Field label="Current password" htmlFor="currentPassword" error={fe.currentPassword} className="sm:max-w-[calc(50%-0.5rem)]">
          <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!fe.currentPassword} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="newPassword" error={fe.newPassword}>
            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.newPassword} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmNewPassword" error={fe.confirmPassword}>
            <Input id="confirmNewPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.confirmPassword} />
          </Field>
        </div>
        <div className="flex justify-end">
          <PendingButton pending={pending} pendingText="Updating…" variant="outline">
            Update Password
          </PendingButton>
        </div>
      </form>
    </SettingsSection>
  );
}

/** Close the account: the consequence in words, then the password and the email typed out to confirm. */
export function CloseAccountForm({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const { state, pending, onSubmit, ref } = useFormAction(closeAccount);
  const fe = state.fieldErrors ?? {};
  return (
    <SettingsSection
      id="close-title"
      title="Close account"
      tone="danger"
      description="Deletes your name, phone, institution and saved addresses, and signs you out everywhere. Your past orders stay on our records and any in progress are still delivered."
    >
      {open ? (
        <form ref={ref} onSubmit={onSubmit} className="space-y-4 bg-[#ffedea] p-5" noValidate>
          <p className="text-small text-[#831c1e]">
            Closing the account for <span className="font-medium [overflow-wrap:anywhere]">{email}</span> can&apos;t be undone. To order again you&apos;d create a new
            account.
          </p>
          <FormMessage state={state} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current password" htmlFor="closePassword" error={fe.password}>
              <Input
                id="closePassword"
                name="password"
                type="password"
                autoComplete="current-password"
                className="bg-white"
                aria-invalid={!!fe.password}
              />
            </Field>
            <Field label="Type your email to confirm" htmlFor="confirmEmail" error={fe.confirmEmail}>
              <Input
                id="confirmEmail"
                name="confirmEmail"
                type="email"
                autoComplete="off"
                spellCheck={false}
                placeholder={`${email}…`}
                className="bg-white"
                aria-invalid={!!fe.confirmEmail}
              />
            </Field>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending} className="hover:bg-white">
              Keep Account
            </Button>
            <PendingButton pending={pending} pendingText="Closing…" variant="danger">
              Close My Account
            </PendingButton>
          </div>
        </form>
      ) : (
        <Button variant="outline" className="text-danger ring-danger hover:bg-danger hover:text-white" onClick={() => setOpen(true)}>
          Close Account
        </Button>
      )}
    </SettingsSection>
  );
}
