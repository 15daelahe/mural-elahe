/**
 * Estrelinhas pequenas decorativas espalhadas pelo fundo.
 * Sem linhas, sem complexidade — só pontinhos delicados que piscam.
 */

type S = { top: string; left: string; size: number; delay?: number; symbol?: "dot" | "star" | "sparkle" };

const STARS: S[] = [
  { top: "8%",  left: "12%", size: 14, delay: 0,   symbol: "sparkle" },
  { top: "16%", left: "82%", size: 10, delay: 1.5, symbol: "dot" },
  { top: "28%", left: "48%", size: 8,  delay: 2.4, symbol: "dot" },
  { top: "38%", left: "8%",  size: 16, delay: 0.8, symbol: "star" },
  { top: "48%", left: "92%", size: 12, delay: 3.0, symbol: "sparkle" },
  { top: "62%", left: "22%", size: 9,  delay: 1.2, symbol: "dot" },
  { top: "72%", left: "75%", size: 14, delay: 0.4, symbol: "star" },
  { top: "82%", left: "42%", size: 10, delay: 2.7, symbol: "dot" },
  { top: "88%", left: "10%", size: 12, delay: 3.5, symbol: "sparkle" },
  { top: "20%", left: "32%", size: 7,  delay: 4.0, symbol: "dot" },
  { top: "55%", left: "55%", size: 9,  delay: 1.8, symbol: "dot" },
];

export function Stars() {
  return (
    <div
      className="stars pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className="twinkle absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay ?? 0}s`,
            color: "var(--gold)",
          }}
        >
          {s.symbol === "star" && (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2 L14.4 9.2 L22 9.2 L15.8 13.6 L18.2 20.8 L12 16.4 L5.8 20.8 L8.2 13.6 L2 9.2 L9.6 9.2 Z" />
            </svg>
          )}
          {s.symbol === "sparkle" && (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0 L13 11 L24 12 L13 13 L12 24 L11 13 L0 12 L11 11 Z" />
            </svg>
          )}
          {(!s.symbol || s.symbol === "dot") && (
            <span
              className="block w-full h-full rounded-full"
              style={{ background: "currentColor", opacity: 0.55 }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
