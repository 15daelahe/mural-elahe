"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { partyConfig, slideshowConfig } from "@/lib/config";
import type { Photo } from "@/lib/types";

export function Slideshow({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    document.body.classList.add("slideshow-on");
    return () => {
      document.body.classList.remove("slideshow-on");
    };
  }, []);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    if (!sb) return;
    const ch = sb
      .channel("slideshow-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photos" },
        (payload) => {
          const p = payload.new as Photo;
          if (!p.approved || p.is_video) return;
          setPhotos((prev) => [p, ...prev]);
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    if (paused || photos.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % photos.length);
    }, slideshowConfig.intervalMs);
    return () => clearInterval(t);
  }, [paused, photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") setPaused((p) => !p);
      if (e.key === "ArrowLeft")
        setIdx((i) => (i - 1 + photos.length) % Math.max(photos.length, 1));
      if (e.key === "ArrowRight")
        setIdx((i) => (i + 1) % Math.max(photos.length, 1));
      if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  if (!photos.length) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center text-center px-6"
        style={{ background: "#1a1320" }}
      >
        <div>
          <p
            className="script mb-1"
            style={{ fontSize: 60, color: "#e8a5a8", lineHeight: 1 }}
          >
            quase começando
          </p>
          <h1
            className="h-display italic"
            style={{ fontSize: 80, color: "#fbf6ee" }}
          >
            {partyConfig.birthdayGirlName}
          </h1>
          <p style={{ color: "#c8b8d8", marginTop: 16 }}>
            aguardando as primeiras fotos do mural
          </p>
        </div>
      </div>
    );
  }

  const current = photos[idx];

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-pointer"
      style={{ background: "#1a1320" }}
      onClick={() => setPaused((p) => !p)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{
            duration: slideshowConfig.fadeMs / 1000,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="absolute inset-0"
        >
          {/* fundo desfocado em ambiente */}
          <Image
            src={current.image_url}
            alt=""
            fill
            unoptimized
            className="object-cover blur-3xl scale-110 opacity-30"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(26,19,32,0.7) 100%)",
            }}
          />

          {/* polaroid central com a foto */}
          <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
            <div
              className="polaroid"
              style={{
                maxWidth: "min(86vw, 860px)",
                maxHeight: "84vh",
              }}
            >
              <Image
                src={current.image_url}
                alt={current.caption ?? ""}
                width={current.width ?? 1800}
                height={current.height ?? 1800}
                unoptimized
                priority
                className="w-auto max-w-full object-contain"
                style={{ maxHeight: "70vh" }}
              />
              {(current.uploader_name || current.caption) && (
                <div
                  className="text-center mt-3 px-4 pb-1"
                  style={{
                    fontFamily: "var(--font-script)",
                    fontSize: 32,
                    color: "var(--ink)",
                    lineHeight: 1.05,
                  }}
                >
                  {current.uploader_name}
                  {current.uploader_name && current.caption && (
                    <span className="mx-3 text-[var(--blush-deep)]">♡</span>
                  )}
                  {current.caption}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Brand top */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <p
          className="script"
          style={{ fontSize: 36, color: "#e8a5a8", lineHeight: 1 }}
        >
          {partyConfig.birthdayGirlName}
        </p>
        <p
          style={{
            color: "#c8b8d8",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          15 anos · ao vivo
        </p>
      </div>

      {/* Contador top right */}
      <div className="absolute top-6 right-8 z-10 pointer-events-none text-right">
        <p
          style={{
            color: "#fbf6ee",
            fontSize: 13,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {String(idx + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </p>
      </div>

      {paused && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 px-4 py-2 rounded-full"
          style={{
            background: "rgba(251,246,238,0.92)",
            color: "var(--ink)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          ⏸  pausado · toque pra continuar
        </div>
      )}

      <div
        className="absolute bottom-0 inset-x-0 h-px z-10"
        style={{ background: "rgba(251,246,238,0.12)" }}
      >
        <motion.div
          key={`bar-${idx}-${paused}`}
          initial={{ width: 0 }}
          animate={{ width: paused ? "0%" : "100%" }}
          transition={{
            duration: paused ? 0 : slideshowConfig.intervalMs / 1000,
            ease: "linear",
          }}
          className="h-full"
          style={{ background: "#e8a5a8" }}
        />
      </div>
    </div>
  );
}
