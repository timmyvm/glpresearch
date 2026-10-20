"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"];

export async function setMessageStatus(messageId: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  await db.contactMessage.update({ where: { id: messageId }, data: { status } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(messageId: string) {
  await requireAdmin();
  await db.contactMessage.delete({ where: { id: messageId } });
  revalidatePath("/admin", "layout");
  redirect("/admin/messages");
}

export async function deleteSubscriber(subscriberId: string) {
  await requireAdmin();
  await db.subscriber.delete({ where: { id: subscriberId } });
  revalidatePath("/admin/messages");
}
