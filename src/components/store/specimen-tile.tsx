import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { plateInk, specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";

export type SpecimenData = {
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  accentColor: string;
  regulatoryStatus: string | null;
  variants: { price: number; stock: number; label: string }[];
};

/**
 * A catalogue specimen: the vial cut-out alone on its label colour, same scale for every
 * compound, with its name and one fact set beneath in the text face.
 */
export function SpecimenTile({ product, wide = false, className, priority = false }: { product: SpecimenData; wide?: boolean; className?: string; priority?: boolean }) {
  const prices = product.variants.map((v) => v.price);
  const from = prices.length ? Math.min(...prices) : 0;
  const inStock = product.variants.some((v) => v.stock > 0);
  const investigational = product.regulatoryStatus?.toLowerCase().startsWith("investigational");
  const ink = plateInk(product.accentColor);

  return (
    <Link href={`/shop/${product.slug}`} className={cn("group block", wide && "md:col-span-2", className)}>
      <div
        className={cn("relative overflow-clip", wide ? "aspect-[4/5] md:aspect-[8/5]" : "aspect-[4/5]")}
        style={{ backgroundColor: product.accentColor, color: ink }}
      >
        <Image
          src={specimenImage(product.image) ?? product.image}
          alt={`${product.name} research vial`}
          fill
          priority={priority}
          sizes={wide ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="object-contain px-[8%] pt-[10%] pb-[4%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1.5"
        />
        {investigational || !inStock ? (
          <p className="absolute top-3 left-3 text-small font-medium">{!inStock ? "Out of stock" : "Investigational"}</p>
        ) : null}
      </div>
      <p className="mt-3 text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{product.name}</p>
      <p className="mt-0.5 text-body text-muted">{product.subtitle}</p>
      <p className="tabular mt-1 text-body">from {formatMoney(from)}</p>
    </Link>
  );
}
