import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { ReceptorChips } from "./receptor-chips";

export type ProductCardData = {
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  accentColor: string;
  receptorTargets: string;
  regulatoryStatus: string | null;
  variants: { price: number; stock: number; label: string }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const prices = product.variants.map((v) => v.price);
  const from = prices.length ? Math.min(...prices) : 0;
  const inStock = product.variants.some((v) => v.stock > 0);
  const investigational = product.regulatoryStatus?.toLowerCase().startsWith("investigational");

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-ink-900/5"
    >
      <div className="relative aspect-square overflow-hidden bg-[#eef0f3]">
        <Image
          src={product.image}
          alt={`${product.name} research vial`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {investigational ? (
            <span className="rounded-full bg-ink-900/90 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur">
              Investigational
            </span>
          ) : null}
          {!inStock ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 backdrop-blur">
              Out of stock
            </span>
          ) : null}
        </div>
        <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: product.accentColor }} />
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ink-900">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.subtitle}</p>
        </div>
        <ReceptorChips targets={product.receptorTargets} />
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] tracking-wide text-slate-500 uppercase">From</p>
            <p className="text-lg font-semibold text-ink-900">{formatMoney(from)}</p>
          </div>
          <p className="text-xs text-slate-500">{product.variants.map((v) => v.label).join(" · ")}</p>
        </div>
      </div>
    </Link>
  );
}
