"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const COOKIE = "admin-token";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    redirect("/admin?error=1");
  }
  const jar = await cookies();
  jar.set(COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin");
}

export async function deletePhoto(id: string, storagePath: string) {
  const sb = createSupabaseAdmin();
  await sb.storage.from("photos").remove([storagePath]);
  await sb.from("photos").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/wall");
  revalidatePath("/");
}

export async function toggleFeatured(id: string, featured: boolean) {
  const sb = createSupabaseAdmin();
  await sb.from("photos").update({ featured: !featured }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/wall");
}

export async function toggleApproved(id: string, approved: boolean) {
  const sb = createSupabaseAdmin();
  await sb.from("photos").update({ approved: !approved }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/wall");
}
