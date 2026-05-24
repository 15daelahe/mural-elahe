"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Slide = {
  src: string;
  poster?: string;
  isVideo: boolean;
  caption?: string;
  uploader?: string;
};

type Props = {
  slides: Slide[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

async function downloadAsset(slide: Slide) {
  try {
    const res = await fetch(slide.src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const ext = slide.isVideo ? "mp4" : (slide.src.split(".").pop() ?? "jpg").split("?")[0];
    const safe = (slide.uploader ?? "elahe-mural").replace(/[^\w\-]+/g, "-");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safe}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (e) {
    console.error("download failed", e);
    return false;
  }
}

export function Lightbox({ slides, index, onClose, onIndexChange }: Props) {
  const startX = useRef<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const go = (delta: number) => {
    const next = (index + delta + slides.length) % slides.length;
    onIndexChange(next);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides.length]);

  const slide = slides[index];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(58,42,60,0.85), rgba(26,19,32,0.95))",
          backdropFilter: "blur(20px)",
        }}
        onClick={onClose}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        {/* Top bar com download + fechar */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
          <button
            type="button"
            aria-label="Baixar"
            disabled={downloading}
            onClick={async (e) => {
              e.stopPropagation();
              setDownloading(true);
              const ok = await downloadAsset(slides[index]);
              setDownloading(false);
              if (ok) {
                setDownloaded(true);
                setTimeout(() => setDownloaded(false), 1800);
              }
            }}
            title="Baixar"
            className="h-10 px-4 rounded-full bg-paper/15 text-paper text-[12px] flex items-center gap-1.5 hover:bg-paper/25 transition disabled:opacity-60"
          >
            {downloaded ? (
              <>✓ <span className="hidden sm:inline">salvo</span></>
            ) : downloading ? (
              <>… <span className="hidden sm:inline">baixando</span></>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">baixar</span>
              </>
            )}
          </button>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-paper/15 text-paper text-xl flex items-center justify-center hover:bg-paper/25 transition"
          >
            ✕
          </button>
        </div>

        {/* Setas (desktop) */}
        {slides.length > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="hidden sm:flex absolute left-5 z-10 w-11 h-11 rounded-full bg-paper/15 text-paper text-2xl items-center justify-center hover:bg-paper/25 transition"
            >
              ‹
            </button>
            <button
              aria-label="Próxima"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="hidden sm:flex absolute right-5 z-10 w-11 h-11 rounded-full bg-paper/15 text-paper text-2xl items-center justify-center hover:bg-paper/25 transition"
            >
              ›
            </button>
          </>
        )}

        {/* Foto como polaroid maior */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="polaroid"
          style={{
            maxWidth: "min(92vw, 720px)",
            transform: "rotate(0)",
          }}
        >
          <div className="relative">
            {slide.isVideo ? (
              <video
                src={slide.src}
                poster={slide.poster}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[68vh] object-contain bg-black"
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.caption ?? "Foto"}
                width={1600}
                height={1600}
                unoptimized
                className="w-full h-auto max-h-[68vh] object-contain"
              />
            )}
          </div>

          {(slide.uploader || slide.caption) && (
            <div
              className="text-center mt-3 px-3 pb-1"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: 24,
                color: "var(--ink)",
                lineHeight: 1.1,
              }}
            >
              {slide.uploader && <span>{slide.uploader}</span>}
              {slide.uploader && slide.caption && (
                <span className="mx-2" style={{ color: "var(--blush-deep)" }}>♡</span>
              )}
              {slide.caption && <span>{slide.caption}</span>}
            </div>
          )}
        </motion.div>

        {/* Contador */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-paper/60 tracking-widest uppercase">
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
