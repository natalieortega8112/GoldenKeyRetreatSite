"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { setMessageStatus, type MessageStatus } from "@/lib/messages";

async function guard() {
  if (!(await isAdmin())) {
    throw new Error("Not authorized");
  }
}

export async function updateStatus(id: string, status: MessageStatus) {
  await guard();
  await setMessageStatus(id, status);
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
