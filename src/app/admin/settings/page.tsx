import { getSettings } from "@/lib/settings";
import { fromCents } from "@/lib/money";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { updateSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  const values = Object.fromEntries(
    Object.entries({
      ...s,
      shippingStandard: fromCents(s.shippingStandard),
      shippingExpress: fromCents(s.shippingExpress),
      freeShippingThreshold: fromCents(s.freeShippingThreshold),
    }).map(([k, v]) => [k, String(v)]),
  );

  return (
    <>
      <PageHeader title="Settings" description="Store-wide configuration. Changes apply immediately." />
      <SettingsForm action={updateSettings} values={values} />
    </>
  );
}
