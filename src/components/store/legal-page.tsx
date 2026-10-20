import { Markdown } from "./markdown";
import { PageHero } from "./page-hero";

export function LegalPage({ eyebrow, title, description, updated, content }: { eyebrow: string; title: string; description?: string; updated: string; content: string }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <div className="container-page max-w-3xl py-14">
        <p className="text-sm text-slate-500">Last updated {updated}</p>
        <Markdown className="mt-6">{content}</Markdown>
      </div>
    </>
  );
}
