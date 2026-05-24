"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  createSupabaseBrowser,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type { Photo } from "@/lib/types";
import { Lightbox } from "./Lightbox";
import { partyConfig } from "@/lib/config";

const TILTS = ["tilt-l", "tilt-r", "tilt-l2", "tilt-r2", "", "tilt-r", "tilt-l2", "", "tilt-r2", "tilt-l"];

export function Wall({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    const sb = createSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel("photos-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photos" },
        (payload) => {
          const p = payload.new as Photo;
          if (!p.approved) return;
          setPhotos((prev) => {
            if (prev.some((x) => x.id === p.id)) return prev;
            return [p, ...prev];
          });
          setFlashId(p.id);
          setTimeout(() => setFlashId(null), 2500);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "photos" },
        (payload) => {
          const id = (payload.old as Photo).id;
          setPhotos((prev) => prev.filter((x) => x.id !== id));
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const open = useCallback((idx: number) => setOpenIdx(idx), []);
  const close = useCallback(() => setOpenIdx(null), []);

  const slides = useMemo(
    () =>
      photos.map((p) => ({
        src: p.image_url,
        poster:
          p.thumbnail_url && p.thumbnail_url !== p.image_url
            ? p.thumbnail_url
            : undefined,
        isVideo: p.is_video,
        caption: p.caption ?? undefined,
        uploader: p.uploader_name ?? undefined,
      })),
    [photos],
  );

  return (
    <section className="px-4 sm:px-6 pt-8 pb-20 max-w-[1400px] mx-auto w-full">
      {/* Cabeçalho doce */}
      <header className="text-center mb-10 sm:mb-12">
        <p className="script text-[var(--blush-deep)] text-3xl sm:text-4xl mb-0">
          O nosso
        </p>
        <h1
          className="h-display italic text-ink"
          style={{ fontSize: "clamp(56px, 9vw, 110px)" }}
        >
          mural
        </h1>
        <p className="text-ink-soft mt-2 text-base">
          {photos.length === 0
            ? "Aguardando a primeira foto"
            : `${photos.length} ${photos.length === 1 ? "memória" : "memórias"} • atualiza ao vivo ✨`}
        </p>
        {!supabaseReady && (
          <p className="mt-3 text-xs text-[var(--blush-deep)]">
            ⚠  banco offline — defina .env.local
          </p>
        )}
      </header>

      {photos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="masonry">
          <AnimatePresence initial={false}>
            {photos.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 26,
                  delay: Math.min(i * 0.03, 0.45),
                }}
                className="masonry-item"
              >
                <button
                  type="button"
                  onClick={() => open(i)}
                  className={`polaroid ${TILTS[i % TILTS.length]} block w-full text-left ${
                    flashId === p.id ? "ring-2 ring-[var(--blush)]" : ""
                  }`}
                  aria-label={`Abrir foto ${i + 1}`}
                >
                  <div className="relative overflow-hidden">
                    {p.is_video ? (
                      <div className="relative w-full" style={{ paddingBottom: "120%" }}>
                        {p.thumbnail_url && p.thumbnail_url !== p.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.thumbnail_url}
                            alt={p.caption ?? "Pré-visualização de vídeo"}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={p.image_url}
                            muted
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2 right-2 text-[10px] tracking-wider uppercase text-paper bg-ink/70 px-2 py-1 rounded-full">
                          ▷ vídeo
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={p.image_url}
                        alt={p.caption ?? "Foto da festa"}
                        width={p.width ?? 800}
                        height={p.height ?? 1000}
                        unoptimized
                        className="w-full h-auto object-cover"
                      />
                    )}
                    {flashId === p.id && (
                      <span className="absolute top-2 left-2 text-[10px] tracking-wider uppercase text-paper bg-[var(--blush-deep)] px-2 py-1 rounded-full animate-pulse">
                        ✨ Novo
                      </span>
                    )}
                  </div>
                  <span className="polaroid-caption">
                    {p.uploader_name ?? p.caption ?? "—"}
                  </span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {openIdx !== null && (
        <Lightbox
          slides={slides}
          index={openIdx}
          onClose={close}
          onIndexChange={setOpenIdx}
        />
      )}

      {/* Rodapé delicado */}
      <footer className="mt-16 text-center text-xs text-ink-mute tracking-[0.18em] uppercase">
        feito com carinho para {partyConfig.birthdayGirlName} ♡
      </footer>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="max-w-md mx-auto text-center mt-12 card p-10">
      <p className="script text-[var(--blush-deep)] text-4xl mb-2">
        ainda em branco
      </p>
      <p className="text-ink-soft text-sm mb-6">
        Seja a primeira pessoa a compartilhar uma memória da noite.
      </p>
      <Link href="/upload" className="btn btn-primary">
        Enviar a primeira foto
      </Link>
    </div>
  );
}
