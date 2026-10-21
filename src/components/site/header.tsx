import { getSettings } from "@/lib/settings";
import { HeaderClient } from "./header-client";

export async function Header() {
  const settings = await getSettings();
  return (
    <>
      {settings.announcement ? (
        <p className="bg-surface px-4 py-2 text-center text-small text-ink">{settings.announcement}</p>
      ) : null}
      <HeaderClient />
    </>
  );
}
