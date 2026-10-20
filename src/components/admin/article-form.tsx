"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/actions";
import { cn, slugify } from "@/lib/utils";
import { ARTICLE_CATEGORIES } from "@/lib/admin/articles";
import { estimateReadingMinutes } from "@/lib/admin/format";
import { CheckRow, Field, Input, Select, Textarea } from "./fields";
import { FormFeedback, FormSubmit, PendingContext, useActionForm } from "./action-form";
import { ImageField } from "./image-field";
import { Markdown } from "./markdown";
import { Panel } from "./ui";

const mono = "font-mono text-small"; // taste-skill-ignore: Markdown source and URL slugs are literal code

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
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <div className="space-y-4">
              <Field label="Title" htmlFor="title" error={err("title")}>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  autoComplete="off"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  className="h-11 text-base font-medium"
                />
              </Field>
              <Field label="Excerpt" htmlFor="excerpt" error={err("excerpt")} hint="Shown on article cards and in search results.">
                <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={initial?.excerpt} />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Content"
            description={
              <span className="tabular">
                Markdown. {words.toLocaleString("en-AU")} words, about {estimateReadingMinutes(content)} min to read.
              </span>
            }
            action={
              <div role="tablist" aria-label="Editor view" className="flex gap-4">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={cn("border-b-2 pb-1 text-sm", tab === t ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}
                  >
                    {t === "write" ? "Write" : "Preview"}
                  </button>
                ))}
              </div>
            }
          >
            <Textarea
              name="content"
              aria-label="Article content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              hidden={tab !== "write"}
              rows={28}
              className={mono}
              placeholder={"## Heading\n\nWrite in Markdown. Tables, lists and links work…"}
            />
            {tab === "preview" ? (
              <div className="min-h-64 border border-[#dfe2e8] p-6">
                {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
              </div>
            ) : null}
            {err("content") ? (
              <p className="mt-1.5 text-small text-danger" role="alert">
                {err("content")}
              </p>
            ) : null}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">
          <Panel title="Publishing">
            <div className="space-y-4">
              <CheckRow name="published" defaultChecked={initial?.published ?? false} title="Published" description="Listed in the research library." />
              <CheckRow name="featured" defaultChecked={initial?.featured ?? false} title="Featured" description="Pinned to the top of the library." />
              <Field label="Publish date" htmlFor="publishedAt">
                <Input id="publishedAt" name="publishedAt" type="date" defaultValue={initial?.publishedAt ?? new Date().toISOString().slice(0, 10)} className="tabular" />
              </Field>
              <Field label="Slug" htmlFor="slug" error={err("slug")} hint={`/research/${slug || "…"}`}>
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
              <Field label="Reading time (min)" htmlFor="readingMinutes" hint="Leave empty to estimate it from the word count.">
                <Input id="readingMinutes" name="readingMinutes" type="number" inputMode="numeric" min={1} defaultValue={initial?.readingMinutes ?? ""} className="tabular" />
              </Field>
              <Field label="Cover image" htmlFor="coverImage">
                <ImageField id="coverImage" name="coverImage" defaultValue={initial?.coverImage} />
              </Field>
            </div>
          </Panel>
          <div>
            <FormSubmit className="w-full" variant="ink" pendingText="Saving…">
              {initial ? "Save Article" : "Create Article"}
            </FormSubmit>
            <FormFeedback state={state} compact />
          </div>
        </div>
      </form>
    </PendingContext.Provider>
  );
}
