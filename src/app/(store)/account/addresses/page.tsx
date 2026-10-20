import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AddressBook } from "@/components/account/address-book";
import { PageTitle } from "@/components/account/account-ui";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return (
    <div className="space-y-6">
      <PageTitle title="Addresses">Your default address fills in at checkout. We ship within Australia only.</PageTitle>
      <AddressBook addresses={addresses} />
    </div>
  );
}
