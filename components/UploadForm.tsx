"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { uploadLimits } from "@/lib/config";
import { Toast, type ToastKind } from "./Toast";

type Status = "idle" | "preparing" | "uploading" | "saving" | "done" | "error";

type Preview = {
  id: string;
  file: File;
  url: string;
  isVideo: boolean;
};

const MAX_BYTES = uploadLimits.maxFileSizeMB * 1024 * 1024;

export function UploadForm() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null);
  const dragRef = useRef<HTMLLabelElement>(null);

  const showToast = (msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const accepted: Preview[] = [];
    for (const f of arr) {
      if (!uploadLimits.acceptedMime.includes(f.type as (typeof uploadLimits.acceptedMime)[number])) {
        showToast(`Formato não aceito: ${f.name}`, "error");
        continue;
      }
      if (f.size > MAX_BYTES) {
        showToast(`Arquivo grande demais (${(f.size / 1024 / 1024).toFixed(0)} MB)`, "error");
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file: f,
        url: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video/"),
      });
    }
    if (accepted.length) {
      setPreviews((prev) => [...prev, ...accepted]);
      setStatus("idle");
    }
  }, []);

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.remove("dragging");
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.add("dragging");
  };
  const handleDragLeave = () => {
    dragRef.current?.classList.remove("dragging");
  };

  const upload = async () => {
    if (!previews.length) return;
    const sb = createSupabaseBrowser();
    if (!sb) {
      showToast("Servidor offline — avise o organizador", "error");
      return;
    }
    setStatus("preparing");
    setProgress(0);

    try {
      const total = previews.length;
      for (let i = 0; i < previews.length; i++) {
        const p = previews[i];
        let toUpload: Blob = p.file;
        let mime = p.file.type;
        let width: number | null = null;
        let height: number | null = null;

        if (!p.isVideo) {
          setStatus("preparing");
          const compressed = await imageCompression(p.file, {
            maxSizeMB: 2.5,
            maxWidthOrHeight: uploadLimits.maxImageDimension,
            initialQuality: uploadLimits.imageQuality,
            useWebWorker: true,
            fileType: p.file.type === "image/png" ? "image/png" : "image/jpeg",
          });
          toUpload = compressed;
          mime = compressed.type;
          const dims = await measureImage(URL.createObjectURL(compressed));
          width = dims.w;
          height = dims.h;
        }

        setStatus("uploading");
        const now = new Date();
        const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
        const ext = guessExt(mime, p.file.name);
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await sb.storage.from("photos").upload(path, toUpload, {
          contentType: mime,
          cacheControl: "31536000",
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data: pub } = sb.storage.from("photos").getPublicUrl(path);

        setStatus("saving");
        const { error: insErr } = await sb.from("photos").insert({
          storage_path: path,
          image_url: pub.publicUrl,
          thumbnail_url: pub.publicUrl,
          uploader_name: name.trim() || null,
          caption: caption.trim() || null,
          mime_type: mime,
          file_size: toUpload.size,
          width,
          height,
          is_video: p.isVideo,
        });
        if (insErr) throw insErr;

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setStatus("done");
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      showToast("Sua foto entrou no mural ✨", "success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      showToast(
        err instanceof Error ? err.message : "Falha no envio. Tente de novo.",
        "error",
      );
    }
  };

  const busy = status === "preparing" || status === "uploading" || status === "saving";

  return (
    <section className="px-4 py-10 sm:py-14 max-w-xl mx-auto w-full">
      {/* Cabeçalho doce */}
      <header className="text-center mb-8">
        <p className="script text-[var(--blush-deep)] text-3xl">
          uma foto sua
        </p>
        <h1
          className="h-display italic text-ink"
          style={{ fontSize: "clamp(46px, 8vw, 80px)" }}
        >
          no mural
        </h1>
        <p className="text-ink-soft mt-1 text-sm">
          Suas memórias da noite ✨
        </p>
      </header>

      {/* Dropzone */}
      <label
        ref={dragRef}
        htmlFor="file-input"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="card block cursor-pointer text-center p-10 transition border-dashed border-[var(--blush-soft)] hover:border-[var(--blush)] hover:bg-[var(--paper-soft)] [&.dragging]:bg-[var(--blush-soft)] [&.dragging]:border-[var(--blush-deep)]"
        style={{ borderWidth: 2, borderRadius: 24 }}
      >
        <div
          className="script text-[var(--blush-deep)] mb-2"
          style={{ fontSize: 54, lineHeight: 1 }}
        >
          ✦
        </div>
        <p className="display italic text-2xl text-ink mb-1">
          Toque para escolher
        </p>
        <p className="text-xs text-ink-soft">
          ou arraste aqui · JPG · PNG · MP4
        </p>
        <p className="display italic text-[13px] text-[var(--blush-deep)] mt-3">
          ✿  vídeos curtinhos, até 10 segundos
        </p>
        <input
          id="file-input"
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>

      {previews.length > 0 && (
        <>
          {/* Previews em mini-polaroids */}
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 gap-3">
            <AnimatePresence>
              {previews.map((p, i) => {
                const tilts = ["tilt-l", "tilt-r", "tilt-l2", "tilt-r2"];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className={`polaroid ${tilts[i % 4]} relative`}
                  >
                    <div className="aspect-square overflow-hidden">
                      {p.isVideo ? (
                        <video
                          src={p.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    {!busy && (
                      <button
                        type="button"
                        aria-label="Remover"
                        onClick={() => removePreview(p.id)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--blush-deep)] text-paper text-xs flex items-center justify-center shadow-md hover:scale-110 transition"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Campos */}
          <div className="mt-8 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Seu nome (opcional)"
              disabled={busy}
              className="field"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={140}
              rows={2}
              placeholder="Uma legenda? (opcional)"
              disabled={busy}
              className="field field-area"
            />
            <button
              onClick={upload}
              disabled={busy}
              className="btn btn-primary w-full !text-[14px] !py-3.5 disabled:opacity-70"
            >
              {status === "preparing" && "Preparando…"}
              {status === "uploading" && `Enviando ${progress}%`}
              {status === "saving" && "Quase lá…"}
              {(status === "idle" || status === "done" || status === "error") &&
                `Enviar ${previews.length} ${previews.length === 1 ? "foto" : "fotos"}`}
            </button>

            {busy && (
              <div className="h-1 w-full bg-[var(--paper-deep)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                  className="h-full bg-[var(--blush-deep)]"
                />
              </div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {status === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card mt-10 p-8 text-center"
          >
            <p
              className="script text-[var(--blush-deep)]"
              style={{ fontSize: 56, lineHeight: 1 }}
            >
              obrigada!
            </p>
            <p className="display italic text-2xl text-ink mt-2">
              sua foto já está no mural
            </p>
            <div className="flex justify-center gap-2 mt-5 flex-wrap">
              <Link href="/wall" className="btn btn-primary">
                Ver no mural
              </Link>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="btn btn-ghost"
              >
                Enviar outra
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toast?.msg ?? ""} kind={toast?.kind} show={!!toast} />
    </section>
  );
}

function measureImage(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = url;
  });
}

function guessExt(mime: string, name: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic" || mime === "image/heif") return "heic";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/quicktime") return "mov";
  const ext = name.split(".").pop();
  return (ext ?? "bin").toLowerCase();
}
