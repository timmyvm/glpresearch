import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function headingId(children: React.ReactNode) {
  return textOf(children)
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
          h2: ({ children }) => (
            <h2 id={headingId(children)} data-reveal>
              {children}
            </h2>
          ),
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
            <div className="not-prose my-8 overflow-x-auto [&+h2]:mt-24">
              {/* A real table keeps its row rules. taste-skill-ignore */}
              <table className="tabular w-full text-left text-small [&_td]:border-t [&_td]:border-ink/10 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_th]:pr-4 [&_th]:pb-3 [&_th]:font-medium [&_th]:text-muted">{/* taste-skill-ignore */}
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
