import Image from "next/image";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Articles" };

export default async function ArticlesPage() {
  const articles = await db.article.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <>
      <PageHeader
        title="Research library"
        description="Long-form articles published at /research."
        actions={
          <ButtonLink href="/admin/articles/new">
            <Plus className="size-4" /> New article
          </ButtonLink>
        }
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Article</Th>
            <Th>Category</Th>
            <Th>Read time</Th>
            <Th>Published</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <Td colSpan={5}>
                <EmptyState icon={FileText} title="No articles yet" action={<ButtonLink href="/admin/articles/new">Write the first one</ButtonLink>} />
              </Td>
            </tr>
          ) : null}
          {articles.map((a) => (
            <tr key={a.id} className="group hover:bg-slate-50">
              <Td>
                <Link href={`/admin/articles/${a.id}`} className="flex items-center gap-3">
                  <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-ink-900">
                    {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="64px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900 group-hover:text-mint-700">{a.title}</span>
                    <span className="block max-w-md truncate text-xs text-slate-500">{a.excerpt}</span>
                  </span>
                </Link>
              </Td>
              <Td className="text-xs text-slate-600">{a.category}</Td>
              <Td className="text-xs text-slate-600">{a.readingMinutes} min</Td>
              <Td className="text-xs whitespace-nowrap text-slate-500">{formatDate(a.publishedAt)}</Td>
              <Td>
                <div className="flex gap-1">
                  {a.published ? <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">Published</Badge> : <Badge>Draft</Badge>}
                  {a.featured ? <Badge className="bg-mint-50 text-mint-700 ring-mint-600/20">Featured</Badge> : null}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
