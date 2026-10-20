import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Articles" };

export default async function ArticlesPage() {
  const articles = await db.article.findMany({ orderBy: { publishedAt: "desc" } });
  const drafts = articles.filter((a) => !a.published).length;
  return (
    <>
      <PageHeader
        title="Articles"
        description={`Long-form research published at /research. ${articles.length - drafts} published, ${drafts} draft${drafts === 1 ? "" : "s"}.`}
        actions={
          <ButtonLink href="/admin/articles/new" variant="ink" size="sm">
            New Article
          </ButtonLink>
        }
      />
      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Article</Th>
            <Th className="hidden md:table-cell">Category</Th>
            <Th className="hidden text-right lg:table-cell">Read time</Th>
            <Th className="hidden text-right sm:table-cell">Published</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <Td colSpan={5} className="p-0">
                <EmptyState
                  title="No articles yet."
                  description="Articles appear in the research library once published."
                  action={
                    <ButtonLink href="/admin/articles/new" variant="ink" size="sm">
                      New Article
                    </ButtonLink>
                  }
                />
              </Td>
            </tr>
          ) : null}
          {articles.map((a) => (
            <tr key={a.id} className="hover:bg-surface/50">
              <Td>
                <Link href={`/admin/articles/${a.id}`} className="font-medium text-ink hover:underline">
                  {a.title}
                </Link>
                {a.featured ? <span className="ml-2 text-small text-muted">Featured</span> : null}
                <p className="max-w-[26ch] truncate text-small text-muted sm:max-w-[60ch]">{a.excerpt}</p>
              </Td>
              <Td className="hidden text-muted md:table-cell">{a.category}</Td>
              <Td className="tabular hidden text-right text-muted lg:table-cell">{a.readingMinutes} min</Td>
              <Td className="tabular hidden text-right whitespace-nowrap text-muted sm:table-cell">{formatDate(a.publishedAt)}</Td>
              <Td>
                <span
                  className={`inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap ${
                    a.published ? "bg-surface text-muted" : "bg-[#fffbeb] text-[#92400e]"
                  }`}
                >
                  {a.published ? "Published" : "Draft"}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
