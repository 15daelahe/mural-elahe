import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin-token";

/**
 * Deriva o valor do cookie a partir da senha.
 * Hash determinístico — não revela a senha original e permite verificar
 * sem armazenar a senha em texto puro no cookie.
 * Trocar a ADMIN_PASSWORD invalida automaticamente cookies antigos.
 */
export function sessionToken(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/**
 * Comparação resistente a timing attack.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Confere se o cookie atual corresponde à senha configurada.
 * Server-side. Não joga erro — retorna boolean.
 */
export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, sessionToken(expected));
}

/**
 * Lança erro se não autenticado. Usar no início de Server Actions
 * que mutam dados.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

/**
 * Compara senha enviada com a configurada (timing-safe).
 */
export function checkPassword(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(submitted, expected);
}
