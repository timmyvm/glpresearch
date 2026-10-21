"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { bool, optStr, str, zodErrors, type ActionState } from "@/lib/actions";
import { estimateReadingMinutes, parseDateInput } from "@/lib/admin/format";
import { ARTICLE_CATEGORIES } from "@/lib/admin/articles";

const schema = z.object({
  title: z.string().min(4, "Title is required").max(200),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  excerpt: z.string().min(10, "Write a short excerpt").max(400),
  category: z.enum(ARTICLE_CATEGORIES),
  content: z.string().min(20, "Content is required"),
  author: z.string().min(2).max(120),
});

function revalidateArticles() {
  revalidatePath("/admin/articles");
  revalidateStorefront();
}

export async function saveArticle(articleId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = str(form, "title");
  const parsed = schema.safeParse({
    title,
    slug: str(form, "slug") || slugify(title),
    excerpt: str(form, "excerpt"),
    category: str(form, "category"),
    content: str(form, "content"),
    author: str(form, "author") || "GLP Research Science Team",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const taken = await db.article.findFirst({
    where: { slug: parsed.data.slug, NOT: articleId ? { id: articleId } : undefined },
    select: { id: true },
  });
  if (taken) return { error: "Another article already uses that slug.", fieldErrors: { slug: ["Already in use"] } };

  const minutes = parseInt(str(form, "readingMinutes"), 10);
  const data = {
    ...parsed.data,
    coverImage: optStr(form, "coverImage"),
    readingMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : estimateReadingMinutes(parsed.data.content),
    featured: bool(form, "featured"),
    published: bool(form, "published"),
    publishedAt: parseDateInput(str(form, "publishedAt")) ?? new Date(),
  };

  if (articleId) {
    await db.article.update({ where: { id: articleId }, data });
    revalidateArticles();
    return { ok: true, message: "Article saved." };
  }
  const created = await db.article.create({ data });
  revalidateArticles();
  redirect(`/admin/articles/${created.id}?created=1`);
}

export async function deleteArticle(articleId: string) {
  await requireAdmin();
  await db.article.delete({ where: { id: articleId } });
  revalidateArticles();
  redirect("/admin/articles");
}
