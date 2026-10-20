import { PageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/article-form";
import { saveArticle } from "../actions";

export const metadata = { title: "New article" };

export default function NewArticlePage() {
  return (
    <>
      <PageHeader back={{ href: "/admin/articles", label: "Articles" }} title="New article" />
      <ArticleForm action={saveArticle.bind(null, null)} />
    </>
  );
}
