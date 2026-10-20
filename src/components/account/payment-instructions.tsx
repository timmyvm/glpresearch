import { Clock, Landmark, Bitcoin, Zap } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

const ICON = { BANK_TRANSFER: Landmark, PAYID: Zap, CRYPTO: Bitcoin } as const;

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className={cn("truncate text-sm font-semibold text-ink-900", mono && "font-mono")}>{value}</span>
        <CopyButton value={value} />
      </dd>
    </div>
  );
}

/** How to pay for an order that is awaiting payment. */
export function PaymentInstructions({
  order,
  settings,
  className,
}: {
  order: { number: string; total: number; paymentMethod: string; createdAt: Date | string };
  settings: StoreSettings;
  className?: string;
}) {
  const method = (order.paymentMethod in PAYMENT_METHODS ? order.paymentMethod : "BANK_TRANSFER") as PaymentMethod;
  const Icon = ICON[method];
  const deadline = new Date(new Date(order.createdAt).getTime() + settings.paymentWindowHours * 3600000);
  const total = formatMoney(order.total);

  return (
    <section className={cn("overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xs", className)}>
      <div className="flex items-start gap-3 bg-amber-50 px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-amber-950">
            Complete your payment — {PAYMENT_METHODS[method].label}
          </h3>
          <p className="mt-0.5 text-sm text-amber-900/80">{PAYMENT_METHODS[method].description}</p>
        </div>
      </div>
      <div className="px-5 py-3">
        <dl className="divide-y divide-slate-100">
          <Row label="Amount due" value={total} mono={false} />
          {method === "BANK_TRANSFER" ? (
            <>
              <Row label="Account name" value={settings.bankAccountName} mono={false} />
              <Row label="BSB" value={settings.bankBsb} />
              <Row label="Account number" value={settings.bankAccountNumber} />
            </>
          ) : null}
          {method === "PAYID" ? (
            <>
              <Row label="PayID" value={settings.payId} />
              <Row label="Account name" value={settings.bankAccountName} mono={false} />
            </>
          ) : null}
          {method === "CRYPTO" ? (
            settings.cryptoBtcAddress || settings.cryptoUsdtAddress ? (
              <>
                {settings.cryptoBtcAddress ? <Row label="BTC address" value={settings.cryptoBtcAddress} /> : null}
                {settings.cryptoUsdtAddress ? <Row label="USDT address" value={settings.cryptoUsdtAddress} /> : null}
              </>
            ) : (
              <div className="py-3 text-sm text-slate-600">
                Our team will email you the wallet address and exact amount shortly.
              </div>
            )
          ) : null}
          <Row label="Payment reference" value={order.number} />
        </dl>
      </div>
      <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-600">
        <Clock className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
        <p>
          Use <span className="font-semibold text-ink-900">{order.number}</span> as your payment reference so we can match
          it. Please pay within {settings.paymentWindowHours} hours (by{" "}
          {deadline.toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          ) or the order will be cancelled and stock released.
        </p>
      </div>
    </section>
  );
}
