import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/admin/format";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/article-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteArticle, saveArticle } from "../actions";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/articles", label: "Articles" }}
        title={article.title}
        actions={
          <>
            <Link href={`/research/${article.slug}`} target="_blank" className={buttonClass("ghost", "md")}>
              <ExternalLink className="size-4" /> View
            </Link>
            <ConfirmButton action={deleteArticle.bind(null, article.id)} message={`Delete “${article.title}”?`} size="md">
              Delete
            </ConfirmButton>
          </>
        }
      />
      {sp.created ? (
        <Alert tone="success" className="mb-6">
          Article created.
        </Alert>
      ) : null}
      <ArticleForm action={saveArticle.bind(null, article.id)} initial={{ ...article, publishedAt: toDateInput(article.publishedAt) }} />
    </>
  );
}
