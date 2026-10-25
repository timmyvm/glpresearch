import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { HeaderClient } from "./header-client";

/**
 * The navy strip along the top of every page states the research-use terms (the binding
 * confirmation happens at checkout), with the store's announcement beside it.
 */
export async function Header() {
  const settings = await getSettings();
  return (
    <>
      <div className="bg-ink text-small text-on-navy">
        <div className="frame flex flex-col gap-x-6 gap-y-0.5 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            For laboratory research only, not for human or veterinary use.{" "}
            <Link href="/disclaimer" className="link whitespace-nowrap">
              Research use policy
            </Link>
          </p>
          {settings.announcement ? <p className="text-on-navy-muted">{settings.announcement}</p> : null}
        </div>
      </div>
      <HeaderClient />
    </>
  );
}
