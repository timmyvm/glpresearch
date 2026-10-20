import { requireUser } from "@/lib/auth";
import { EmailForm, PasswordForm, ProfileForm } from "@/components/account/settings-forms";

export const metadata = { title: "Profile & security" };

export default async function SettingsPage() {
  const user = await requireUser("/account/settings");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Profile & security</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your details, sign-in email and password.</p>
      </div>
      <ProfileForm user={user} />
      <EmailForm key={user.email} email={user.email} />
      <PasswordForm />
    </div>
  );
}
