"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/actions";
import { cn, slugify } from "@/lib/utils";
import { ARTICLE_CATEGORIES } from "@/lib/admin/articles";
import { estimateReadingMinutes } from "@/lib/admin/format";
import { FormSubmit, PendingContext, useActionForm } from "./action-form";
import { ImageField } from "./image-field";
import { Markdown } from "./markdown";

type Article = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: string;
  author: string;
  coverImage: string | null;
  readingMinutes: number;
  featured: boolean;
  published: boolean;
  publishedAt: string;
};

export function ArticleForm({ action, initial }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; initial?: Article }) {
  const { state, onSubmit, pending } = useActionForm(action);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [content, setContent] = useState(initial?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <Field label="Title" htmlFor="title" error={err("title")}>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  className="h-11 text-base font-semibold"
                />
              </Field>
              <Field label="Excerpt" htmlFor="excerpt" error={err("excerpt")} hint="Shown on article cards and in search results.">
                <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={initial?.excerpt} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Content"
              description={`Markdown · ~${content.trim() ? content.trim().split(/\s+/).length : 0} words · ~${estimateReadingMinutes(content)} min read`}
              action={
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                  {(["write", "preview"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-semibold capitalize",
                        tab === t ? "bg-white text-ink-900 shadow-sm" : "text-slate-500 hover:text-ink-900",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              }
            />
            <CardBody>
              <textarea name="content" value={content} onChange={(e) => setContent(e.target.value)} hidden={tab !== "write"} rows={28}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-ink-900 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none"
                placeholder={"## Heading\n\nWrite in **markdown**. Tables, lists and links are supported."}
              />
              {tab === "preview" ? (
                <div className="min-h-64 rounded-lg border border-slate-200 p-6">
                  {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-slate-400">Nothing to preview yet.</p>}
                </div>
              ) : null}
              {err("content") ? <p className="mt-1.5 text-xs text-rose-600">{err("content")}</p> : null}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader title="Publishing" />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <Checkbox name="published" defaultChecked={initial?.published ?? true} /> Published
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <Checkbox name="featured" defaultChecked={initial?.featured ?? false} /> Featured
              </label>
              <Field label="Publish date" htmlFor="publishedAt">
                <Input id="publishedAt" name="publishedAt" type="date" defaultValue={initial?.publishedAt ?? new Date().toISOString().slice(0, 10)} />
              </Field>
              <Field label="Slug" htmlFor="slug" error={err("slug")} hint={`/research/${slug || "…"}`}>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="Category" htmlFor="category" error={err("category")}>
                <Select id="category" name="category" defaultValue={initial?.category ?? "Fundamentals"}>
                  {ARTICLE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Author" htmlFor="author">
                <Input id="author" name="author" defaultValue={initial?.author ?? "GLP Research Science Team"} />
              </Field>
              <Field label="Reading time (min)" htmlFor="readingMinutes" hint="Leave blank to estimate from word count.">
                <Input id="readingMinutes" name="readingMinutes" type="number" min={1} defaultValue={initial?.readingMinutes ?? ""} />
              </Field>
              <Field label="Cover image" htmlFor="coverImage">
                <ImageField id="coverImage" name="coverImage" defaultValue={initial?.coverImage} />
              </Field>
            </CardBody>
          </Card>
          <FormSubmit className="w-full" size="lg" pendingText="Saving…">
            {initial ? "Save article" : "Publish article"}
          </FormSubmit>
          {state.error ? <Alert tone="error" title={state.error} /> : null}
          {state.ok && state.message ? <Alert tone="success">{state.message}</Alert> : null}
        </div>
      </form>
    </PendingContext.Provider>
  );
}
