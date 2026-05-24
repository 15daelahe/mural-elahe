/**
 * Personalização da festa.
 *
 * Para trocar nome da aniversariante, frases e cores principais
 * sem mexer em código de componente, edite este arquivo.
 */
export const partyConfig = {
  /** Nome usado em h1, metadata, slideshow */
  birthdayGirlName: process.env.NEXT_PUBLIC_BIRTHDAY_NAME ?? "Aniversariante",
  /** Frase de impacto na landing */
  tagline:
    process.env.NEXT_PUBLIC_TAGLINE ??
    "Compartilhe seu olhar dessa noite ✨",
  /** Subtítulo curto */
  subtitle:
    process.env.NEXT_PUBLIC_SUBTITLE ??
    "Mande suas fotos e veja a festa acontecer em tempo real",
  /** Hashtag opcional exibida no rodapé */
  hashtag: process.env.NEXT_PUBLIC_HASHTAG ?? "#15Anos",
  /** URL pública do mural (usada no QR Code). Detectada por padrão. */
  publicUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : ""),
} as const;

/** Limites de upload */
export const uploadLimits = {
  maxFileSizeMB: 50, // antes da compressão (vídeo até 50MB)
  maxImageDimension: 2400, // px
  imageQuality: 0.82,
  acceptedMime: [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
  ],
} as const;

/** Slideshow */
export const slideshowConfig = {
  intervalMs: 5500,
  fadeMs: 900,
} as const;
