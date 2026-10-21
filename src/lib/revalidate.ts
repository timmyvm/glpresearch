import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public pages are served as static HTML. Anything that changes what they show (products,
 * stock, batches, articles, store settings) calls this so visitors see it straight away.
 * It marks every page stale; each one re-renders on its next visit.
 */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
