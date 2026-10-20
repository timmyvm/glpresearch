import "server-only";
import { cache } from "react";
import { db } from "./db";

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  orderPrefix: string;
  shippingStandard: number; // cents
  shippingExpress: number; // cents
  freeShippingThreshold: number; // cents, 0 disables
  bankAccountName: string;
  bankBsb: string;
  bankAccountNumber: string;
  payId: string;
  cryptoBtcAddress: string;
  cryptoUsdtAddress: string;
  paymentWindowHours: number;
  dispatchCutoff: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "GLP Research",
  supportEmail: "support@glpresearch.com",
  supportPhone: "",
  announcement: "Free tracked shipping on orders over $250",
  orderPrefix: "GLP",
  shippingStandard: 1295,
  shippingExpress: 1995,
  freeShippingThreshold: 25000,
  bankAccountName: "GLP Research Pty Ltd",
  bankBsb: "000-000",
  bankAccountNumber: "00000000",
  payId: "payments@glpresearch.com",
  cryptoBtcAddress: "",
  cryptoUsdtAddress: "",
  paymentWindowHours: 48,
  dispatchCutoff: "Orders paid before 1pm AEST ship same business day",
};

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await db.setting.findMany();
  const stored: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      stored[row.key] = JSON.parse(row.value);
    } catch {
      stored[row.key] = row.value;
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored } as StoreSettings;
});

export async function saveSettings(values: Partial<StoreSettings>) {
  await db.$transaction(
    Object.entries(values).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      }),
    ),
  );
}

export function shippingCost(settings: StoreSettings, method: string, subtotalAfterDiscount: number) {
  if (method === "EXPRESS") return settings.shippingExpress;
  if (settings.freeShippingThreshold > 0 && subtotalAfterDiscount >= settings.freeShippingThreshold) return 0;
  return settings.shippingStandard;
}
