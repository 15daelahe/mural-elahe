import { loginAction } from "@/app/admin/actions";

export function AdminLogin({ error = false }: { error?: boolean }) {
  return (
    <section className="flex-1 flex items-center justify-center px-4 py-16">
      <form action={loginAction} className="card p-8 w-full max-w-sm text-center">
        <p
          className="script text-[var(--blush-deep)] mb-1"
          style={{ fontSize: 42, lineHeight: 1 }}
        >
          bastidores
        </p>
        <h1 className="display italic text-ink text-3xl mb-1">
          painel
        </h1>
        <p className="text-ink-soft text-sm mb-6">
          acesso da organização
        </p>

        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Senha"
          className="field text-center"
        />

        {error && (
          <p className="text-[var(--blush-deep)] text-xs mt-3">
            senha incorreta ✕
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full mt-5">
          Entrar
        </button>
      </form>
    </section>
  );
}
