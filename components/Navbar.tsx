import Link from "next/link";
import { partyConfig } from "@/lib/config";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pt-3 sm:pt-4">
        <nav className="card flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3">
          <Link href="/" className="flex items-baseline gap-2.5 group">
            <span className="display italic text-2xl sm:text-3xl text-ink leading-none">
              {partyConfig.birthdayGirlName}
            </span>
            <span
              className="script text-[var(--blush-deep)] leading-none"
              style={{ fontSize: "22px" }}
            >
              15
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/wall"
              className="hidden sm:block px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink transition"
            >
              Mural
            </Link>
            <Link href="/upload" className="btn btn-primary !py-2 !px-4 !text-[12px]">
              Enviar foto
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
