import { cookies } from "next/headers";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

const COOKIE = "admin-token";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return (
      <section className="p-10 max-w-xl mx-auto text-center">
        <div className="glass rounded-3xl p-8">
          <h1 className="font-display text-3xl text-gradient mb-2">
            Admin não configurado
          </h1>
          <p className="text-ink-soft">
            Defina <code>ADMIN_PASSWORD</code> em <code>.env.local</code> para
            ativar esta área.
          </p>
        </div>
      </section>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const authed = token === expected;

  if (!authed) return <AdminLogin error={error === "1"} />;

  let photos: Photo[] = [];
  let totalSize = 0;
  let count = 0;
  try {
    const sb = createSupabaseAdmin();
    const [{ data }, { count: c }] = await Promise.all([
      sb.from("photos").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("photos").select("*", { count: "exact", head: true }),
    ]);
    photos = (data ?? []) as Photo[];
    count = c ?? 0;
    totalSize = photos.reduce((s, p) => s + (p.file_size ?? 0), 0);
  } catch (e) {
    console.error(e);
  }

  return <AdminDashboard photos={photos} totalCount={count} totalSize={totalSize} />;
}
