import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "./safe-next";

/** Bounces visitors who are already signed in away from the sign-in / register pages. */
export async function redirectIfSignedIn(next?: string) {
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next, user.role === "ADMIN" ? "/admin" : "/account"));
}
