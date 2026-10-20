import { requireUser } from "@/lib/auth";
import { CloseAccountForm, EmailForm, PasswordForm, ProfileForm } from "@/components/account/settings-forms";
import { PageTitle } from "@/components/account/account-ui";

export const metadata = { title: "Profile and security" };

export default async function SettingsPage() {
  const user = await requireUser("/account/settings");
  return (
    <div>
      <PageTitle title="Profile and security" className="mb-6">
        Your details, the email you sign in with, and your password.
      </PageTitle>
      <ProfileForm user={user} />
      <EmailForm key={user.email} email={user.email} />
      <PasswordForm />
      {user.role === "ADMIN" ? null : <CloseAccountForm email={user.email} />}
    </div>
  );
}
