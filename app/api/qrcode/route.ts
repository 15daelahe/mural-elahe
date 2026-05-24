import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * GET /api/qrcode?url=<url>&size=600
 * Retorna PNG do QR Code (cor rosa).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const url = searchParams.get("url") ?? `${origin}/wall`;
  const size = Math.min(2000, Math.max(200, Number(searchParams.get("size") ?? 800)));

  const buffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#3a2a3c",
      light: "#fbf6ee",
    },
  });

  // Convert Buffer to Uint8Array for proper typing
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
