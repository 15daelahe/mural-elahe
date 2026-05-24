"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { partyConfig } from "@/lib/config";

export function QrButton() {
  const [open, setOpen] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${partyConfig.publicUrl || window.location.origin}/wall`
      : "/wall";
  const qrSrc = `/api/qrcode?size=900&url=${encodeURIComponent(url)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost !py-2 !px-4 !text-[12px]"
      >
        QR Code
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-ink/65 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-sm w-full p-6 text-center"
            >
              <p
                className="script text-[var(--blush-deep)]"
                style={{ fontSize: 38, lineHeight: 1 }}
              >
                convite
              </p>
              <h3 className="display italic text-ink text-2xl mb-4">
                QR Code do mural
              </h3>

              <div className="bg-paper p-3 rounded-lg shadow-sm inline-block">
                <Image
                  src={qrSrc}
                  alt="QR Code"
                  width={280}
                  height={280}
                  unoptimized
                  className="w-full h-auto"
                />
              </div>

              <p className="text-xs text-ink-soft mt-4 break-all">{url}</p>

              <div className="flex gap-2 mt-5">
                <a
                  href={qrSrc}
                  download="elahe-mural-qr.png"
                  className="btn btn-primary flex-1"
                >
                  Baixar PNG
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost flex-1"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
