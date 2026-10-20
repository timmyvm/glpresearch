"use client";

import { ActionForm, FormSubmit } from "./action-form";
import { ImageField } from "./image-field";
import { Card, CardBody } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/actions";

type Batch = {
  productId: string;
  batchNumber: string;
  variantLabel: string | null;
  purity: number;
  massSpec: string | null;
  testMethod: string;
  laboratory: string;
  testedAt: string;
  expiresAt: string;
  coaUrl: string | null;
  notes: string | null;
  published: boolean;
};

export function BatchForm({
  action,
  products,
  initial,
  defaultProductId,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  products: { id: string; name: string; variants: { label: string }[] }[];
  initial?: Batch;
  defaultProductId?: string;
}) {
  return (
    <ActionForm action={action} className="max-w-3xl">
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Product" htmlFor="productId">
            <Select id="productId" name="productId" defaultValue={initial?.productId ?? defaultProductId ?? products[0]?.id}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Variant (optional)" htmlFor="variantLabel" hint="e.g. 10 mg">
            <Input id="variantLabel" name="variantLabel" defaultValue={initial?.variantLabel ?? ""} list="variant-labels" />
            <datalist id="variant-labels">
              {[...new Set(products.flatMap((p) => p.variants.map((v) => v.label)))].map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
          <Field label="Batch / lot number" htmlFor="batchNumber">
            <Input id="batchNumber" name="batchNumber" defaultValue={initial?.batchNumber ?? ""} className="font-mono uppercase" placeholder="SEM-2610-101" />
          </Field>
          <Field label="Purity (%)" htmlFor="purity">
            <Input id="purity" name="purity" type="number" step="0.01" min={0} max={100} defaultValue={initial?.purity ?? ""} placeholder="99.42" />
          </Field>
          <Field label="Test method" htmlFor="testMethod">
            <Input id="testMethod" name="testMethod" defaultValue={initial?.testMethod ?? "RP-HPLC (UV 214 nm) / ESI-MS"} />
          </Field>
          <Field label="Laboratory" htmlFor="laboratory">
            <Input id="laboratory" name="laboratory" defaultValue={initial?.laboratory ?? "Independent ISO/IEC 17025-accredited laboratory"} />
          </Field>
          <Field label="Tested on" htmlFor="testedAt">
            <Input id="testedAt" name="testedAt" type="date" defaultValue={initial?.testedAt ?? new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Retest / expiry date" htmlFor="expiresAt">
            <Input id="expiresAt" name="expiresAt" type="date" defaultValue={initial?.expiresAt ?? ""} />
          </Field>
          <Field label="Mass spectrometry result" htmlFor="massSpec" className="sm:col-span-2">
            <Input id="massSpec" name="massSpec" defaultValue={initial?.massSpec ?? ""} placeholder="Identity confirmed — observed 4113.6 Da" />
          </Field>
          <Field label="COA document (image or PDF URL)" htmlFor="coaUrl" className="sm:col-span-2">
            <ImageField id="coaUrl" name="coaUrl" defaultValue={initial?.coaUrl} placeholder="https://… or upload an image" />
          </Field>
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={2} defaultValue={initial?.notes ?? ""} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-800 sm:col-span-2">
            <Checkbox name="published" defaultChecked={initial?.published ?? true} /> Published on the public Lab Testing page
          </label>
        </CardBody>
        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <FormSubmit pendingText="Saving…">{initial ? "Save batch" : "Create batch"}</FormSubmit>
        </div>
      </Card>
    </ActionForm>
  );
}
