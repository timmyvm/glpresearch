import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AddressBook } from "@/components/account/address-book";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Addresses</h1>
        <p className="mt-1 text-sm text-slate-600">Saved addresses appear at checkout. We currently ship within Australia.</p>
      </div>
      <AddressBook addresses={addresses} />
    </div>
  );
}
