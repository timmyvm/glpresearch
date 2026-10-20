import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [user, settings, products] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, subtitle: true, accentColor: true },
    }),
  ]);

  return (
    <>
      {settings.announcement ? (
        <div className="bg-ink-950 text-center text-xs font-medium text-ink-100">
          <p className="container-page py-2">{settings.announcement}</p>
        </div>
      ) : null}
      <HeaderClient
        products={products}
        user={user ? { firstName: user.firstName, role: user.role } : null}
      />
    </>
  );
}
