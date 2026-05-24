import { ImageResponse } from "next/og";
import { partyConfig } from "@/lib/config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${partyConfig.birthdayGirlName} · 15 anos · Mural compartilhado`;

async function loadFont(url: string) {
  const res = await fetch(url);
  return res.arrayBuffer();
}

export default async function OpengraphImage() {
  // Fontsource via jsDelivr — fontes ESTÁTICAS (satori não suporta variable fonts)
  const [cormorantItalic, italianno] = await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-500-italic.ttf",
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/italianno@latest/latin-400-normal.ttf",
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#fbf6ee",
          backgroundImage:
            "radial-gradient(900px 600px at 85% -10%, rgba(232,165,168,0.30) 0%, transparent 60%)," +
            "radial-gradient(800px 500px at 10% 110%, rgba(200,184,216,0.32) 0%, transparent 65%)," +
            "radial-gradient(700px 400px at 50% 50%, rgba(228,200,156,0.10) 0%, transparent 70%)",
          padding: "60px",
          fontFamily: '"Cormorant", serif',
        }}
      >
        {/* Estrelinhas decorativas (SVG inline) */}
        <Star x={120} y={110} size={28} />
        <Star x={1040} y={140} size={22} variant="dot" />
        <Star x={150} y={510} size={20} variant="dot" />
        <Star x={1060} y={490} size={26} />
        <Star x={600} y={70} size={16} variant="dot" />

        {/* "Bem-vindos" caligráfico */}
        <div
          style={{
            fontFamily: '"Italianno", cursive',
            fontSize: 80,
            color: "#c98086",
            lineHeight: 1,
            marginBottom: -6,
          }}
        >
          Bem-vindos ao mural de
        </div>

        {/* "Elahe" gigante italic */}
        <div
          style={{
            fontFamily: '"Cormorant", serif',
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 240,
            color: "#3a2a3c",
            letterSpacing: "-0.02em",
            lineHeight: 0.95,
            margin: 0,
          }}
        >
          {partyConfig.birthdayGirlName}
        </div>

        {/* Ornamento + "15 anos" */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginTop: 12,
          }}
        >
          <OrnamentLine />
          <div
            style={{
              fontFamily: '"Italianno", cursive',
              fontSize: 86,
              color: "#c98086",
              lineHeight: 1,
            }}
          >
            15 anos
          </div>
          <OrnamentLine flip />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: '"Cormorant", serif',
            fontStyle: "italic",
            fontSize: 30,
            color: "#6d5868",
            marginTop: 22,
            textAlign: "center",
            maxWidth: 720,
          }}
        >
          {partyConfig.tagline.replace("✨", "·")}
        </div>

        {/* Footer hashtag */}
        <div
          style={{
            position: "absolute",
            bottom: 38,
            fontFamily: "sans-serif",
            fontSize: 14,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#9b8a93",
          }}
        >
          {partyConfig.hashtag} · mural compartilhado
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant",
          data: cormorantItalic,
          style: "italic",
          weight: 500,
        },
        { name: "Italianno", data: italianno, style: "normal", weight: 400 },
      ],
    },
  );
}

function Star({
  x,
  y,
  size: s,
  variant = "star",
}: {
  x: number;
  y: number;
  size: number;
  variant?: "star" | "dot";
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      style={{ position: "absolute", left: x, top: y }}
      fill="#c79762"
    >
      {variant === "star" ? (
        <path d="M12 0 L13 11 L24 12 L13 13 L12 24 L11 13 L0 12 L11 11 Z" />
      ) : (
        <circle cx="12" cy="12" r="5" opacity="0.55" />
      )}
    </svg>
  );
}

function OrnamentLine({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="120"
      height="14"
      viewBox="0 0 120 14"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
    >
      <path
        d="M2 7 Q30 7 58 7 M64 7 L74 2 L84 7 L94 2 L104 7 L114 7"
        stroke="#c79762"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
