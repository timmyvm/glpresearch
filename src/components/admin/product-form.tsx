"use client";

import { useId, useState } from "react";
import type { ActionState } from "@/lib/actions";
import { fromCents } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { Panel } from "./ui";
import { CheckRow, Checkbox, Field, Input, Select, Textarea } from "./fields";
import { ImageField } from "./image-field";
import { FormFeedback, FormSubmit, PendingContext, useActionForm } from "./action-form";

type Variant = {
  id?: string;
  key: string;
  label: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  lowStockThreshold: string;
  image: string;
  active: boolean;
};

type Reference = { key: string; label: string; url: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  subtitle: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  accentColor: string;
  aliases: string | null;
  developer: string | null;
  receptorTargets: string;
  molecularFormula: string | null;
  molecularWeight: string | null;
  casNumber: string | null;
  sequence: string | null;
  aminoAcidCount: number | null;
  halfLife: string | null;
  regulatoryStatus: string | null;
  mechanism: string | null;
  research: string | null;
  references: string | null;
  form: string;
  purity: string;
  storage: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  variants: {
    id: string;
    label: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    lowStockThreshold: number;
    image: string | null;
    active: boolean;
  }[];
};

let keySeq = 0;
const nextKey = () => `k${++keySeq}`;

function parseReferences(json: string | null): Reference[] {
  try {
    const arr = JSON.parse(json ?? "[]") as { label: string; url: string }[];
    return arr.map((r) => ({ key: nextKey(), label: r.label, url: r.url }));
  } catch {
    return [];
  }
}

const smallAction = "press inline-flex h-8 items-center border border-[#d1d5db] bg-white px-3 text-small font-medium text-ink hover:bg-surface";
const mono = "font-mono text-small"; // taste-skill-ignore: SKUs, slugs, CAS numbers, sequences and Markdown source are literal code

export function ProductForm({
  action,
  initial,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  initial?: ProductFormValues;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  const uid = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [accent, setAccent] = useState(initial?.accentColor ?? "#2DD4BF");
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({
          id: v.id,
          key: nextKey(),
          label: v.label,
          sku: v.sku,
          price: fromCents(v.price),
          compareAtPrice: v.compareAtPrice ? fromCents(v.compareAtPrice) : "",
          stock: String(v.stock),
          lowStockThreshold: String(v.lowStockThreshold),
          image: v.image ?? "",
          active: v.active,
        }))
      : [{ key: nextKey(), label: "10 mg", sku: "", price: "", compareAtPrice: "", stock: "0", lowStockThreshold: "10", image: "", active: true }],
  );
  const [references, setReferences] = useState<Reference[]>(() => parseReferences(initial?.references ?? null));

  const err = (key: string) => state.fieldErrors?.[key]?.[0];

  const updateVariant = (key: string, patch: Partial<Variant>) =>
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const updateReference = (key: string, patch: Partial<Reference>) =>
    setReferences((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const variantsJson = JSON.stringify(
    variants.map(({ id, label, sku, price, compareAtPrice, stock, lowStockThreshold, image, active }) => ({
      id,
      label,
      sku,
      price,
      compareAtPrice,
      stock,
      lowStockThreshold,
      image,
      active,
    })),
  );
  const referencesJson = JSON.stringify(references.map(({ label, url }) => ({ label, url })));

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit}>
        <input type="hidden" name="variants" value={variantsJson} />
        <input type="hidden" name="references" value={referencesJson} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <Panel title="Basics" description="What customers see on the shop and product pages.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="name" error={err("name")}>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    autoComplete="off"
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                    required
                  />
                </Field>
                <Field label="Slug" htmlFor="slug" error={err("slug")} hint={`/shop/${slug || "…"}`}>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                    className={mono}
                  />
                </Field>
                <Field label="Subtitle" htmlFor="subtitle" error={err("subtitle")} className="sm:col-span-2">
                  <Input id="subtitle" name="subtitle" defaultValue={initial?.subtitle} placeholder="Long-acting GLP-1 receptor agonist…" />
                </Field>
                <Field label="Category" htmlFor="category" error={err("category")}>
                  <Select id="category" name="category" defaultValue={initial?.category ?? "GLP1"}>
                    <option value="GLP1">GLP-1 agonist</option>
                    <option value="DUAL">Dual agonist</option>
                    <option value="TRIPLE">Triple agonist</option>
                  </Select>
                </Field>
                <Field label="Label colour" htmlFor="accentColor" error={err("accentColor")} hint="Marks this compound across the store and admin.">
                  <div className="flex">
                    <input
                      type="color"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="h-10 w-12 shrink-0 cursor-pointer border border-[#dfe2e8] bg-white p-1"
                      aria-label="Pick label colour"
                    />
                    <Input
                      id="accentColor"
                      name="accentColor"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      className={`${mono} -ml-px`}
                    />
                  </div>
                </Field>
                <Field label="Short description" htmlFor="shortDescription" error={err("shortDescription")} className="sm:col-span-2">
                  <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={initial?.shortDescription} />
                </Field>
                <Field label="Description" htmlFor="description" error={err("description")} hint="Markdown." className="sm:col-span-2">
                  <Textarea id="description" name="description" rows={8} defaultValue={initial?.description} className={mono} />
                </Field>
                <Field label="Main image" htmlFor="image" error={err("image")} className="sm:col-span-2">
                  <ImageField id="image" name="image" defaultValue={initial?.image} />
                </Field>
              </div>
            </Panel>

            <Panel
              title="Variants"
              description="Sizes, prices in dollars, and stock. Raising a sold-out variant above zero emails everyone waiting on it."
              action={
                <button
                  type="button"
                  onClick={() =>
                    setVariants((vs) => [
                      ...vs,
                      { key: nextKey(), label: "", sku: "", price: "", compareAtPrice: "", stock: "0", lowStockThreshold: "10", image: "", active: true },
                    ])
                  }
                  className={smallAction}
                >
                  Add Variant
                </button>
              }
              bodyClassName="px-0 pb-0"
            >
              {variants.map((v, i) => {
                const vid = `${uid}v${i}`; // not v.key: the key counter differs between server and client
                return (
                  <fieldset key={v.key} className="border-t border-ink/[0.07] px-5 py-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <legend className="text-sm font-medium text-ink">
                        {v.label || `Variant ${i + 1}`}
                        {v.id ? null : <span className="ml-2 font-normal text-muted">New</span>}
                      </legend>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-ink">
                          <Checkbox checked={v.active} onChange={(e) => updateVariant(v.key, { active: e.target.checked })} /> On sale
                        </label>
                        <button
                          type="button"
                          disabled={variants.length === 1}
                          title={variants.length === 1 ? "A product needs at least one variant" : undefined}
                          onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                          className="text-small text-muted hover:text-danger disabled:cursor-not-allowed disabled:hover:text-muted"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <Field label="Label" htmlFor={`${vid}-label`}>
                        <Input id={`${vid}-label`} value={v.label} onChange={(e) => updateVariant(v.key, { label: e.target.value })} placeholder="10 mg…" autoComplete="off" />
                      </Field>
                      <Field label="SKU" htmlFor={`${vid}-sku`}>
                        <Input
                          id={`${vid}-sku`}
                          value={v.sku}
                          onChange={(e) => updateVariant(v.key, { sku: e.target.value.toUpperCase() })}
                          className={mono}
                          placeholder="GLP-XXX-10…"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="Price ($)" htmlFor={`${vid}-price`}>
                        <Input id={`${vid}-price`} value={v.price} onChange={(e) => updateVariant(v.key, { price: e.target.value })} inputMode="decimal" placeholder="139.00" className="tabular" />
                      </Field>
                      <Field label="Was ($)" htmlFor={`${vid}-compare`}>
                        <Input
                          id={`${vid}-compare`}
                          value={v.compareAtPrice}
                          onChange={(e) => updateVariant(v.key, { compareAtPrice: e.target.value })}
                          inputMode="decimal"
                          placeholder="Optional"
                          className="tabular"
                        />
                      </Field>
                      <Field label="Stock" htmlFor={`${vid}-stock`}>
                        <Input id={`${vid}-stock`} type="number" inputMode="numeric" min={0} value={v.stock} onChange={(e) => updateVariant(v.key, { stock: e.target.value })} className="tabular" />
                      </Field>
                      <Field label="Low stock at" htmlFor={`${vid}-low`}>
                        <Input
                          id={`${vid}-low`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={v.lowStockThreshold}
                          onChange={(e) => updateVariant(v.key, { lowStockThreshold: e.target.value })}
                          className="tabular"
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <ImageField
                        value={v.image}
                        onChange={(image) => updateVariant(v.key, { image })}
                        label={`Image for ${v.label || `variant ${i + 1}`}`}
                        placeholder="Variant image, optional. Uses the main image if empty…"
                      />
                    </div>
                  </fieldset>
                );
              })}
            </Panel>

            <Panel title="Research monograph" description="Shown on the product's Research and Specifications tabs.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Research codes and aliases" htmlFor="aliases" hint="Comma separated.">
                  <Input id="aliases" name="aliases" defaultValue={initial?.aliases ?? ""} autoComplete="off" />
                </Field>
                <Field label="Developer" htmlFor="developer">
                  <Input id="developer" name="developer" defaultValue={initial?.developer ?? ""} autoComplete="off" />
                </Field>
                <Field label="Receptor targets" htmlFor="receptorTargets" error={err("receptorTargets")} hint="Comma separated, like GIPR,GLP-1R.">
                  <Input id="receptorTargets" name="receptorTargets" defaultValue={initial?.receptorTargets ?? "GLP-1R"} className={mono} spellCheck={false} />
                </Field>
                <Field label="Half-life" htmlFor="halfLife">
                  <Input id="halfLife" name="halfLife" defaultValue={initial?.halfLife ?? ""} placeholder="About 7 days…" />
                </Field>
                <Field label="Molecular formula" htmlFor="molecularFormula">
                  <Input id="molecularFormula" name="molecularFormula" defaultValue={initial?.molecularFormula ?? ""} className={mono} spellCheck={false} />
                </Field>
                <Field label="Molecular weight" htmlFor="molecularWeight">
                  <Input id="molecularWeight" name="molecularWeight" defaultValue={initial?.molecularWeight ?? ""} className="tabular" />
                </Field>
                <Field label="CAS number" htmlFor="casNumber">
                  <Input id="casNumber" name="casNumber" defaultValue={initial?.casNumber ?? ""} className={mono} spellCheck={false} />
                </Field>
                <Field label="Amino acid count" htmlFor="aminoAcidCount" error={err("aminoAcidCount")}>
                  <Input id="aminoAcidCount" name="aminoAcidCount" type="number" inputMode="numeric" min={0} defaultValue={initial?.aminoAcidCount ?? ""} className="tabular" />
                </Field>
                <Field label="Sequence" htmlFor="sequence" className="sm:col-span-2">
                  <Textarea id="sequence" name="sequence" rows={2} defaultValue={initial?.sequence ?? ""} className={mono} spellCheck={false} />
                </Field>
                <Field label="Regulatory status" htmlFor="regulatoryStatus" className="sm:col-span-2">
                  <Input id="regulatoryStatus" name="regulatoryStatus" defaultValue={initial?.regulatoryStatus ?? ""} />
                </Field>
                <Field label="Mechanism of action" htmlFor="mechanism" hint="Markdown." className="sm:col-span-2">
                  <Textarea id="mechanism" name="mechanism" rows={6} defaultValue={initial?.mechanism ?? ""} className={mono} />
                </Field>
                <Field label="Key published findings" htmlFor="research" hint="Markdown." className="sm:col-span-2">
                  <Textarea id="research" name="research" rows={6} defaultValue={initial?.research ?? ""} className={mono} />
                </Field>
              </div>

              <div className="mt-6 border-t border-ink/[0.07] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">References</p>
                  <button type="button" onClick={() => setReferences((rs) => [...rs, { key: nextKey(), label: "", url: "" }])} className={smallAction}>
                    Add Reference
                  </button>
                </div>
                {references.length === 0 ? <p className="text-sm text-muted">No references yet.</p> : null}
                <div className="space-y-2">
                  {references.map((r, i) => (
                    <div key={r.key} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={r.label}
                        onChange={(e) => updateReference(r.key, { label: e.target.value })}
                        aria-label={`Reference ${i + 1} citation`}
                        placeholder="Author et al. Journal Year;Vol:Pages…"
                        className="sm:flex-[2]"
                      />
                      <Input
                        value={r.url}
                        onChange={(e) => updateReference(r.key, { url: e.target.value })}
                        aria-label={`Reference ${i + 1} link`}
                        placeholder="https://doi.org/…"
                        className={`${mono} sm:flex-1`}
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => setReferences((rs) => rs.filter((x) => x.key !== r.key))}
                        className="h-10 shrink-0 px-2 text-left text-small text-muted hover:text-danger"
                        aria-label={`Remove reference ${i + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">
            <Panel title="Visibility">
              <div className="space-y-4">
                <CheckRow name="active" defaultChecked={initial?.active ?? false} title="On sale" description="Visible and orderable in the store." />
                <CheckRow name="featured" defaultChecked={initial?.featured ?? false} title="Featured" description="Shown on the home page." />
                <Field label="Sort order" htmlFor="sortOrder" hint="Lower numbers appear first.">
                  <Input id="sortOrder" name="sortOrder" type="number" inputMode="numeric" defaultValue={initial?.sortOrder ?? 0} className="tabular" />
                </Field>
              </div>
            </Panel>

            <Panel title="Storage and specs">
              <div className="space-y-4">
                <Field label="Form" htmlFor="form">
                  <Input id="form" name="form" defaultValue={initial?.form ?? "Lyophilized powder"} />
                </Field>
                <Field label="Purity" htmlFor="purity">
                  <Input id="purity" name="purity" defaultValue={initial?.purity ?? "≥99% (HPLC)"} />
                </Field>
                <Field label="Storage" htmlFor="storage">
                  <Textarea id="storage" name="storage" rows={3} defaultValue={initial?.storage ?? "Store lyophilized at −20 °C, protected from light and moisture."} />
                </Field>
              </div>
            </Panel>

            <div>
              <FormSubmit className="w-full" variant="ink" pendingText="Saving…">
                {initial ? "Save Product" : "Create Product"}
              </FormSubmit>
              <FormFeedback state={state} compact />
            </div>
          </div>
        </div>
      </form>
    </PendingContext.Provider>
  );
}
