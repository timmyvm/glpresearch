import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

const PAY_TITLE: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Pay by bank transfer",
  PAYID: "Pay by PayID",
  CRYPTO: "Pay in cryptocurrency",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="flex min-w-0 items-center gap-3">
        <span className="tabular truncate font-medium">{value}</span>
        <CopyButton value={value} />
      </dd>
    </div>
  );
}

/**
 * How to pay for an order that is awaiting payment. The dominant block on the order page:
 * the amount due set large, then each detail with its own copy button.
 */
export function PaymentInstructions({
  order,
  settings,
  action,
  className,
}: {
  order: { number: string; total: number; paymentMethod: string; createdAt: Date | string; paymentClaimedAt?: Date | string | null };
  settings: StoreSettings;
  action?: React.ReactNode;
  className?: string;
}) {
  const method = (order.paymentMethod in PAYMENT_METHODS ? order.paymentMethod : "BANK_TRANSFER") as PaymentMethod;
  const deadline = new Date(new Date(order.createdAt).getTime() + settings.paymentWindowHours * 3600000);
  const total = formatMoney(order.total);
  const deadlineText = new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(deadline);

  return (
    <section className={cn("bg-field-mint text-ink", className)} aria-labelledby="pay-title">
      <div className="grid items-start gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <h2 id="pay-title" className="text-lead font-medium">
              {order.paymentClaimedAt ? "We're checking your payment" : PAY_TITLE[method]}
            </h2>
            <p className="mt-2 max-w-[46ch] text-small">
              {order.paymentClaimedAt
                ? "Thanks for letting us know. We match payments within one business day and email you as soon as it is confirmed."
                : `${PAYMENT_METHODS[method].description} Use ${order.number} as the reference so we can match it.`}
            </p>
          </div>
          <div>
            <p className="text-small">Amount due</p>
            <p className="tabular text-index font-medium">{total}</p>
            <p className="mt-2 text-small">
              Pay by {deadlineText}. After {settings.paymentWindowHours} hours unpaid orders are cancelled and the stock released.
            </p>
          </div>
          {action ? <div>{action}</div> : null}
        </div>
        <dl className="bg-white px-5">
          <Row label="Amount" value={total} />
          {method === "BANK_TRANSFER" ? (
            <>
              <Row label="Account name" value={settings.bankAccountName} />
              <Row label="BSB" value={settings.bankBsb} />
              <Row label="Account number" value={settings.bankAccountNumber} />
            </>
          ) : null}
          {method === "PAYID" ? (
            <>
              <Row label="PayID" value={settings.payId} />
              <Row label="Account name" value={settings.bankAccountName} />
            </>
          ) : null}
          {method === "CRYPTO" ? (
            settings.cryptoBtcAddress || settings.cryptoUsdtAddress ? (
              <>
                {settings.cryptoBtcAddress ? <Row label="BTC address" value={settings.cryptoBtcAddress} /> : null}
                {settings.cryptoUsdtAddress ? <Row label="USDT address" value={settings.cryptoUsdtAddress} /> : null}
              </>
            ) : (
              <div className="py-3 text-small">Our team will email the wallet address and the exact amount shortly.</div>
            )
          ) : null}
          <Row label="Reference" value={order.number} />
        </dl>
      </div>
    </section>
  );
}
