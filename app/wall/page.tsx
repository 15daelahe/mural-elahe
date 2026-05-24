import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Wall } from "@/components/Wall";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

async function WallData() {
  let initial: Photo[] = [];
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from("photos")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(180);
    initial = (data ?? []) as Photo[];
  } catch {
    /* sem Supabase */
  }
  return <Wall initial={initial} />;
}

function WallSkeleton() {
  return (
    <div className="px-4 sm:px-6 pt-8 max-w-[1400px] mx-auto w-full">
      <div className="masonry">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="masonry-item skeleton"
            style={{ height: 160 + ((i * 47) % 240) }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WallPage() {
  return (
    <Suspense fallback={<WallSkeleton />}>
      <WallData />
    </Suspense>
  );
}
