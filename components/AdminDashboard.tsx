"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  deletePhoto,
  logoutAction,
  toggleApproved,
  toggleFeatured,
} from "@/app/admin/actions";
import type { Photo } from "@/lib/types";
import { QrButton } from "./QrButton";

export function AdminDashboard({
  photos,
  totalCount,
  totalSize,
}: {
  photos: Photo[];
  totalCount: number;
  totalSize: number;
}) {
  const [filter, setFilter] = useState<"all" | "featured" | "pending">("all");
  const [pending, startTransition] = useTransition();

  const list = photos.filter((p) => {
    if (filter === "featured") return p.featured;
    if (filter === "pending") return !p.approved;
    return true;
  });

  const sizeMB = (totalSize / 1024 / 1024).toFixed(1);
  const featuredCount = photos.filter((p) => p.featured).length;
  const hiddenCount = photos.filter((p) => !p.approved).length;

  return (
    <section className="px-4 sm:px-6 py-8 max-w-[1400px] mx-auto w-full">
      {/* Cabeçalho */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="script text-[var(--blush-deep)] text-3xl">painel</p>
          <h1
            className="display italic text-ink"
            style={{ fontSize: "clamp(40px, 6vw, 60px)", lineHeight: 0.95 }}
          >
            da festa
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <QrButton />
          <Link href="/slideshow" className="btn btn-ghost !py-2 !px-4 !text-[12px]">
            Telão
          </Link>
          <Link href="/wall" className="btn btn-ghost !py-2 !px-4 !text-[12px]">
            Mural
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost !py-2 !px-4 !text-[12px]">
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Stats em pequenos cartões */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="memórias" value={totalCount} />
        <Stat label="destaques" value={featuredCount} accent />
        <Stat label="ocultas" value={hiddenCount} />
        <Stat label="armazenado" value={`${sizeMB} MB`} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "featured", "pending"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-4 py-1.5 rounded-full text-[12px] transition ${
              filter === k
                ? "bg-ink text-paper"
                : "bg-[var(--paper-soft)] text-ink-soft hover:text-ink"
            }`}
          >
            {k === "all" && `Todas (${photos.length})`}
            {k === "featured" && `Destaques (${featuredCount})`}
            {k === "pending" && `Ocultas (${hiddenCount})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-ink-soft italic text-center py-12">Nada por aqui.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {list.map((p) => (
            <motion.div
              key={p.id}
              layout
              className="card overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square bg-paper-deep">
                {p.is_video ? (
                  p.thumbnail_url && p.thumbnail_url !== p.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={p.image_url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <Image
                    src={p.image_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
                {p.featured && (
                  <span className="absolute top-2 left-2 text-[10px] bg-[var(--gold)] text-paper px-2 py-1 rounded-full">
                    ★ destaque
                  </span>
                )}
                {!p.approved && (
                  <span className="absolute top-2 right-2 text-[10px] bg-[var(--blush-deep)] text-paper px-2 py-1 rounded-full">
                    oculta
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="text-sm text-ink truncate font-medium">
                  {p.uploader_name ?? "anônimo"}
                </div>
                <div className="text-[11px] text-ink-mute truncate">
                  {new Date(p.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  <ActionBtn
                    disabled={pending}
                    onClick={() => startTransition(() => toggleFeatured(p.id, p.featured))}
                    title="Destacar"
                    label="★"
                    active={p.featured}
                  />
                  <ActionBtn
                    disabled={pending}
                    onClick={() => startTransition(() => toggleApproved(p.id, p.approved))}
                    title={p.approved ? "Ocultar" : "Mostrar"}
                    label={p.approved ? "👁" : "✕"}
                  />
                  <ActionBtn
                    disabled={pending}
                    danger
                    onClick={() => {
                      if (confirm("Excluir esta foto?"))
                        startTransition(() => deletePhoto(p.id, p.storage_path));
                    }}
                    title="Excluir"
                    label="✕"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="text-[11px] tracking-[0.18em] uppercase text-ink-mute mb-1">
        {label}
      </div>
      <div
        className={`display ${accent ? "text-[var(--gold)]" : "text-ink"}`}
        style={{ fontSize: 34, lineHeight: 1, fontWeight: 500 }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  disabled,
  title,
  active = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  const bg = active
    ? "bg-[var(--gold-soft)] text-ink"
    : danger
      ? "bg-[var(--blush-soft)] text-ink hover:bg-[var(--blush-deep)] hover:text-paper"
      : "bg-[var(--paper-soft)] text-ink hover:bg-[var(--lavender-soft)]";
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`py-1.5 text-sm rounded-md transition disabled:opacity-50 ${bg}`}
    >
      {label}
    </button>
  );
}
