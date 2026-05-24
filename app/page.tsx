import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { partyConfig } from "@/lib/config";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getHeroData() {
  try {
    const sb = await createSupabaseServer();
    const [{ count }, { data }] = await Promise.all([
      sb.from("photos").select("*", { count: "exact", head: true }).eq("approved", true),
      sb.from("photos")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    return { count: count ?? 0, preview: (data ?? []) as Photo[] };
  } catch {
    return { count: 0, preview: [] as Photo[] };
  }
}

async function Hero() {
  const { count, preview } = await getHeroData();

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center">
      {/* Eyebrow doce */}
      <p className="rise script text-[var(--blush-deep)] text-3xl sm:text-4xl mb-1">
        Bem-vindos
      </p>

      {/* Nome gigante em italic */}
      <h1
        className="h-display italic text-ink rise-d1"
        style={{
          fontSize: "clamp(74px, 14vw, 180px)",
          fontWeight: 500,
        }}
      >
        {partyConfig.birthdayGirlName}
      </h1>

      {/* Decoração entre nome e "15 anos" */}
      <div className="rise-d2 flex items-center gap-4 mt-2 mb-3">
        <Decoration />
        <span
          className="script text-[var(--blush-deep)]"
          style={{ fontSize: "56px", lineHeight: 1 }}
        >
          15 anos
        </span>
        <Decoration flip />
      </div>

      {/* Tagline */}
      <p
        className="rise-d3 display italic text-ink-soft max-w-md"
        style={{ fontSize: "clamp(20px, 2.4vw, 26px)" }}
      >
        {partyConfig.tagline}
      </p>

      <p className="rise-d3 text-ink-soft text-sm mt-3 max-w-sm">
        {partyConfig.subtitle}
      </p>

      {/* CTAs */}
      <div className="rise-d4 mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/wall" className="btn btn-primary">
          Entrar no mural
        </Link>
        <Link href="/upload" className="btn btn-soft">
          Enviar uma foto
        </Link>
      </div>

      {/* Contador delicado */}
      <div className="rise-d5 mt-10 inline-flex items-center gap-2 text-[13px] text-ink-soft">
        <Sparkle />
        <span>
          <strong className="text-ink font-medium">
            {String(count).padStart(2, "0")}
          </strong>{" "}
          {count === 1 ? "memória já no mural" : "memórias já no mural"}
        </span>
      </div>

      {/* Preview de fotos recentes — pequenas polaroids */}
      {preview.length > 0 && (
        <div className="rise-d5 mt-10 flex items-center justify-center flex-wrap gap-3 sm:gap-4 max-w-xl">
          {preview.slice(0, 5).map((p, i) => {
            const tilts = [-3.5, 2.2, -1.5, 3.0, -2.4];
            return (
              <Link
                key={p.id}
                href="/wall"
                className="polaroid w-20 sm:w-24 block"
                style={{ transform: `rotate(${tilts[i]}deg)` }}
              >
                <div className="aspect-square overflow-hidden">
                  {p.is_video ? (
                    <div className="w-full h-full flex items-center justify-center bg-paper-deep text-ink-soft">
                      ▷
                    </div>
                  ) : (
                    <Image
                      src={p.image_url}
                      alt=""
                      width={180}
                      height={180}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Hashtag rodapé */}
      <p className="mt-12 text-xs tracking-[0.18em] uppercase text-ink-mute">
        {partyConfig.hashtag}
      </p>
    </section>
  );
}

function Decoration({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 12"
      className="text-[var(--gold)]"
      style={{
        width: 60,
        height: 12,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      fill="none"
    >
      <path
        d="M2 6 Q 15 6, 28 6 M 32 6 L 38 2 L 44 6 L 50 2 L 56 6"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx="58" cy="6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 text-[var(--gold)]"
      fill="currentColor"
    >
      <path d="M12 0 L13 11 L24 12 L13 13 L12 24 L11 13 L0 12 L11 11 Z" />
    </svg>
  );
}

function HeroFallback() {
  return (
    <section className="flex-1 flex items-center justify-center px-4">
      <h1
        className="h-display italic text-ink"
        style={{ fontSize: "clamp(74px, 14vw, 180px)" }}
      >
        {partyConfig.birthdayGirlName}
      </h1>
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <Hero />
    </Suspense>
  );
}
