import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function headingId(children: React.ReactNode) {
  const text = Array.isArray(children) ? children.join("") : String(children ?? "");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-research", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="not-prose my-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm [&_td]:border-t [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-2.5 [&_th]:bg-ink-50 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-ink-900">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.replace(/^##\s+/, "").trim();
      return { text, id: headingId(text) };
    });
}
