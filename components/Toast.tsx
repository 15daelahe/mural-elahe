"use client";

import { AnimatePresence, motion } from "framer-motion";

export type ToastKind = "success" | "error" | "info";

export function Toast({
  message,
  kind = "info",
  show,
}: {
  message: string;
  kind?: ToastKind;
  show: boolean;
}) {
  const bg =
    kind === "success"
      ? "bg-[var(--blush)] text-ink"
      : kind === "error"
        ? "bg-[var(--blush-deep)] text-paper"
        : "bg-ink text-paper";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={`fixed bottom-7 inset-x-0 mx-auto w-fit max-w-[92vw] z-50 px-5 py-3 rounded-full shadow-xl ${bg}`}
        >
          <span className="text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
