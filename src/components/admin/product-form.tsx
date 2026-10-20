"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/actions";
import { fromCents } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { ImageField } from "./image-field";
import { FormSubmit, PendingContext, useActionForm } from "./action-form";

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

export function ProductForm({
  action,
  initial,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  initial?: ProductFormValues;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
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
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="variants" value={variantsJson} />
      <input type="hidden" name="references" value={referencesJson} />

      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.ok && state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Basics" description="What customers see on the shop and product pages." />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" error={err("name")}>
                <Input
                  id="name"
                  name="name"
                  value={name}
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
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className="font-mono"
                />
              </Field>
              <Field label="Subtitle" htmlFor="subtitle" error={err("subtitle")} className="sm:col-span-2">
                <Input id="subtitle" name="subtitle" defaultValue={initial?.subtitle} placeholder="e.g. Long-acting GLP-1 receptor agonist" />
              </Field>
              <Field label="Category" htmlFor="category" error={err("category")}>
                <Select id="category" name="category" defaultValue={initial?.category ?? "GLP1"}>
                  <option value="GLP1">GLP-1 agonist</option>
                  <option value="DUAL">Dual agonist</option>
                  <option value="TRIPLE">Triple agonist</option>
                </Select>
              </Field>
              <Field label="Accent colour" htmlFor="accentColor" error={err("accentColor")}>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                    aria-label="Pick accent colour"
                  />
                  <Input id="accentColor" name="accentColor" value={accent} onChange={(e) => setAccent(e.target.value)} className="font-mono" />
                </div>
              </Field>
              <Field label="Short description" htmlFor="shortDescription" error={err("shortDescription")} className="sm:col-span-2">
                <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={initial?.shortDescription} />
              </Field>
              <Field label="Description (markdown)" htmlFor="description" error={err("description")} className="sm:col-span-2">
                <Textarea id="description" name="description" rows={8} defaultValue={initial?.description} className="font-mono text-xs" />
              </Field>
              <Field label="Main image" htmlFor="image" error={err("image")} className="sm:col-span-2">
                <ImageField id="image" name="image" defaultValue={initial?.image} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Variants"
              description="Sizes, pricing (in dollars) and stock."
              action={
                <button
                  type="button"
                  onClick={() =>
                    setVariants((vs) => [
                      ...vs,
                      { key: nextKey(), label: "", sku: "", price: "", compareAtPrice: "", stock: "0", lowStockThreshold: "10", image: "", active: true },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-slate-50"
                >
                  <Plus className="size-3.5" /> Add variant
                </button>
              }
            />
            <CardBody className="space-y-4">
              {variants.map((v, i) => (
                <div key={v.key} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Variant {i + 1} {v.id ? "" : <span className="text-mint-700 normal-case">· new</span>}
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-ink-800">
                        <Checkbox checked={v.active} onChange={(e) => updateVariant(v.key, { active: e.target.checked })} /> Active
                      </label>
                      <button
                        type="button"
                        disabled={variants.length === 1}
                        onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <Field label="Label">
                      <Input value={v.label} onChange={(e) => updateVariant(v.key, { label: e.target.value })} placeholder="10 mg" />
                    </Field>
                    <Field label="SKU">
                      <Input value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value.toUpperCase() })} className="font-mono" placeholder="GLP-XXX-10" />
                    </Field>
                    <Field label="Price ($)">
                      <Input value={v.price} onChange={(e) => updateVariant(v.key, { price: e.target.value })} inputMode="decimal" placeholder="139.00" />
                    </Field>
                    <Field label="Compare at ($)">
                      <Input value={v.compareAtPrice} onChange={(e) => updateVariant(v.key, { compareAtPrice: e.target.value })} inputMode="decimal" placeholder="—" />
                    </Field>
                    <Field label="Stock">
                      <Input type="number" min={0} value={v.stock} onChange={(e) => updateVariant(v.key, { stock: e.target.value })} />
                    </Field>
                    <Field label="Low stock at">
                      <Input type="number" min={0} value={v.lowStockThreshold} onChange={(e) => updateVariant(v.key, { lowStockThreshold: e.target.value })} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <VariantImage value={v.image} onChange={(image) => updateVariant(v.key, { image })} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Research monograph" description="Scientific data shown on the product's Research and Specifications tabs." />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Research codes / aliases" htmlFor="aliases" hint="Comma separated">
                <Input id="aliases" name="aliases" defaultValue={initial?.aliases ?? ""} />
              </Field>
              <Field label="Developer" htmlFor="developer">
                <Input id="developer" name="developer" defaultValue={initial?.developer ?? ""} />
              </Field>
              <Field label="Receptor targets" htmlFor="receptorTargets" error={err("receptorTargets")} hint="Comma separated, e.g. GIPR,GLP-1R">
                <Input id="receptorTargets" name="receptorTargets" defaultValue={initial?.receptorTargets ?? "GLP-1R"} className="font-mono" />
              </Field>
              <Field label="Half-life" htmlFor="halfLife">
                <Input id="halfLife" name="halfLife" defaultValue={initial?.halfLife ?? ""} placeholder="~7 days" />
              </Field>
              <Field label="Molecular formula" htmlFor="molecularFormula">
                <Input id="molecularFormula" name="molecularFormula" defaultValue={initial?.molecularFormula ?? ""} className="font-mono" />
              </Field>
              <Field label="Molecular weight" htmlFor="molecularWeight">
                <Input id="molecularWeight" name="molecularWeight" defaultValue={initial?.molecularWeight ?? ""} />
              </Field>
              <Field label="CAS number" htmlFor="casNumber">
                <Input id="casNumber" name="casNumber" defaultValue={initial?.casNumber ?? ""} className="font-mono" />
              </Field>
              <Field label="Amino acid count" htmlFor="aminoAcidCount" error={err("aminoAcidCount")}>
                <Input id="aminoAcidCount" name="aminoAcidCount" type="number" min={0} defaultValue={initial?.aminoAcidCount ?? ""} />
              </Field>
              <Field label="Sequence" htmlFor="sequence" className="sm:col-span-2">
                <Textarea id="sequence" name="sequence" rows={2} defaultValue={initial?.sequence ?? ""} className="font-mono text-xs" />
              </Field>
              <Field label="Regulatory status" htmlFor="regulatoryStatus" className="sm:col-span-2">
                <Input id="regulatoryStatus" name="regulatoryStatus" defaultValue={initial?.regulatoryStatus ?? ""} />
              </Field>
              <Field label="Mechanism of action (markdown)" htmlFor="mechanism" className="sm:col-span-2">
                <Textarea id="mechanism" name="mechanism" rows={6} defaultValue={initial?.mechanism ?? ""} className="font-mono text-xs" />
              </Field>
              <Field label="Key published findings (markdown)" htmlFor="research" className="sm:col-span-2">
                <Textarea id="research" name="research" rows={6} defaultValue={initial?.research ?? ""} className="font-mono text-xs" />
              </Field>
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-800">References</p>
                  <button
                    type="button"
                    onClick={() => setReferences((rs) => [...rs, { key: nextKey(), label: "", url: "" }])}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-slate-50"
                  >
                    <Plus className="size-3.5" /> Add reference
                  </button>
                </div>
                {references.length === 0 ? <p className="text-xs text-slate-500">No references yet.</p> : null}
                <div className="space-y-2">
                  {references.map((r) => (
                    <div key={r.key} className="flex flex-col gap-2 sm:flex-row">
                      <Input value={r.label} onChange={(e) => updateReference(r.key, { label: e.target.value })} placeholder="Author et al. Journal Year;Vol:Pages" className="sm:flex-[2]" />
                      <Input value={r.url} onChange={(e) => updateReference(r.key, { url: e.target.value })} placeholder="https://doi.org/…" className="font-mono text-xs sm:flex-1" />
                      <button
                        type="button"
                        onClick={() => setReferences((rs) => rs.filter((x) => x.key !== r.key))}
                        className="inline-flex h-10 items-center justify-center rounded-lg px-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove reference"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader title="Visibility" />
            <CardBody className="space-y-3">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox name="active" defaultChecked={initial?.active ?? true} className="mt-0.5" />
                <span>
                  <span className="font-medium text-ink-900">Active</span>
                  <span className="block text-xs text-slate-500">Visible and purchasable in the store.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox name="featured" defaultChecked={initial?.featured ?? false} className="mt-0.5" />
                <span>
                  <span className="font-medium text-ink-900">Featured</span>
                  <span className="block text-xs text-slate-500">Highlighted on the home page.</span>
                </span>
              </label>
              <Field label="Sort order" htmlFor="sortOrder" hint="Lower numbers appear first.">
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Storage & specs" />
            <CardBody className="space-y-4">
              <Field label="Form" htmlFor="form">
                <Input id="form" name="form" defaultValue={initial?.form ?? "Lyophilized powder"} />
              </Field>
              <Field label="Purity" htmlFor="purity">
                <Input id="purity" name="purity" defaultValue={initial?.purity ?? "≥99% (HPLC)"} />
              </Field>
              <Field label="Storage" htmlFor="storage">
                <Textarea
                  id="storage"
                  name="storage"
                  rows={3}
                  defaultValue={initial?.storage ?? "Store lyophilized at −20 °C, protected from light and moisture."}
                />
              </Field>
            </CardBody>
          </Card>

          <FormSubmit className="w-full" size="lg" pendingText="Saving…">
            {initial ? "Save product" : "Create product"}
          </FormSubmit>
          {state.error ? <Alert tone="error" title={state.error} /> : null}
          {state.ok && state.message ? <Alert tone="success">{state.message}</Alert> : null}
        </div>
      </div>
    </form>
    </PendingContext.Provider>
  );
}

function VariantImage({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Wraps ImageField semantics for controlled variant rows (no form name; value lives in JSON state).
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URLs */}
        {value ? <img src={value} alt="" className="size-full object-cover" /> : null}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Variant image URL (optional — falls back to main image)" className="text-xs" />
      <label className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-ink-800 hover:bg-slate-50">
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
