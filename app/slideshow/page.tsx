import { createSupabaseServer } from "@/lib/supabase/server";
import { Slideshow } from "@/components/Slideshow";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SlideshowPage() {
  let initial: Photo[] = [];
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from("photos")
      .select("*")
      .eq("approved", true)
      .eq("is_video", false) // slideshow: só fotos
      .order("created_at", { ascending: false })
      .limit(200);
    initial = (data ?? []) as Photo[];
  } catch {
    /* sem dados */
  }
  return <Slideshow initial={initial} />;
}

export const metadata = {
  title: "Slideshow • Mural",
};
