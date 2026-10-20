import { z, type ZodError } from "zod";

/** Shape returned by every form server action (used with useActionState). */
export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = {};

export function zodErrors(error: ZodError): ActionState {
  return {
    error: "Please check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
  };
}

export function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function optStr(form: FormData, key: string) {
  const v = str(form, key);
  return v === "" ? null : v;
}

export function bool(form: FormData, key: string) {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}
