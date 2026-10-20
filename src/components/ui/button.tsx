import Link from "next/link";
import { cn } from "@/lib/utils";

// Square corners, Title Case labels, one press response. See DESIGN.md.
const variants = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  accent: "bg-accent text-accent-ink hover:bg-accent-strong",
  ink: "bg-ink text-on-navy hover:bg-ink-800",
  outline: "bg-transparent text-ink ring-2 ring-ink ring-inset hover:bg-ink hover:text-on-navy",
  ghost: "bg-transparent text-ink hover:bg-surface",
  danger: "bg-danger text-white hover:bg-[#a52a08]",
  light: "bg-white text-ink hover:bg-surface",
} as const;

const sizes = {
  sm: "h-9 px-3 text-small gap-1.5",
  md: "h-11 px-5 text-small gap-2",
  lg: "h-14 px-7 text-body gap-2",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "press inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
