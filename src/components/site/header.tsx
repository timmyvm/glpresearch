import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <>
      {settings.announcement ? (
        <p className="bg-surface px-4 py-2 text-center text-small text-ink">{settings.announcement}</p>
      ) : null}
      <HeaderClient user={user ? { firstName: user.firstName, role: user.role } : null} />
    </>
  );
}
