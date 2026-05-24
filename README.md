# Mural Compartilhado — Festa de 15 Anos

Plataforma web moderna para uma festa de 15 anos: convidados escaneiam um QR Code
e entram direto em um mural colaborativo onde podem enviar fotos/vídeos e ver
as memórias da noite aparecerem em **tempo real** — estilo Instagram privado da festa.

Visual: glassmorphism + paleta rosa / lilás / dourado + tipografia Playfair Display +
animações suaves com Framer Motion. Mobile-first; envio em menos de 10 segundos.

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (com `@theme inline`)
- **Supabase** (Postgres + Storage + Realtime) via `@supabase/ssr`
- **Framer Motion** — animações
- **browser-image-compression** — compressão client-side
- **qrcode** — geração via API route

> O PRD original pediu Next.js 15. Como `create-next-app@latest` instala 16+,
> ficamos com a versão atual (compatível com o PRD: App Router, Server Components,
> mesmas convenções). Veja `node_modules/next/dist/docs/` para diferenças.

---

## Rotas

| Rota          | O que faz                                                       |
|---------------|-----------------------------------------------------------------|
| `/`           | Landing — hero, contador, preview de fotos recentes             |
| `/wall`       | Mural masonry em tempo real + lightbox com swipe                |
| `/upload`     | Envio com compressão automática, drag-and-drop, múltiplas fotos |
| `/slideshow`  | Carrossel fullscreen para TV/telão (atalhos: ␣ pausa, ←/→ navega, F fullscreen) |
| `/admin`      | Painel protegido por senha (destacar, ocultar, excluir, QR)     |
| `/api/qrcode` | Gera PNG do QR Code (`?url=...&size=900`)                       |

---

## Setup local

### 1. Pré-requisitos
- Node.js ≥ 20
- Conta gratuita no Supabase (https://supabase.com)

### 2. Instalar
```bash
npm install
```

### 3. Criar projeto Supabase

1. Acesse https://supabase.com/dashboard → **New project**
2. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Rodar o schema

No **SQL Editor** do Supabase, cole e execute o conteúdo de
[`supabase/schema.sql`](supabase/schema.sql). Isso cria:

- Tabela `photos` com índices
- Tabela `photo_likes` + trigger de contagem
- Políticas RLS (leitura pública, insert anônimo, update/delete só admin)
- Publica as tabelas no canal `supabase_realtime`
- Policies do bucket `photos` (leitura/insert público; delete só admin)

### 5. Criar o bucket de Storage

**Storage → Create bucket → name: `photos` → Public: ✅**.
(As policies do SQL já cobrem leitura/escrita.)

### 6. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_BIRTHDAY_NAME=Sofia
NEXT_PUBLIC_TAGLINE=Compartilhe seu olhar dessa noite ✨
NEXT_PUBLIC_HASHTAG=#Sofia15
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_PASSWORD=uma-senha-forte-aqui
```

### 7. Rodar
```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy na Vercel

1. Faça push do código para o GitHub.
2. https://vercel.com/new → importe o repositório.
3. Em **Environment Variables**, adicione TODAS as variáveis do `.env.local`
   (não esqueça `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_PASSWORD`).
4. Defina `NEXT_PUBLIC_SITE_URL` com o domínio final (ex: `https://sofia15.vercel.app`).
5. Deploy. Vercel detecta Next.js automaticamente.

> **Realtime**: no projeto Supabase, verifique
> **Database → Replication → supabase_realtime** — as tabelas `photos` e
> `photo_likes` precisam estar listadas (o script SQL já adiciona).

---

## Como usar no dia da festa

1. **Antes**:
   - Configure `NEXT_PUBLIC_BIRTHDAY_NAME` etc. e faça deploy.
   - Entre em `/admin`, clique **QR Code**, baixe o PNG.
   - Imprima e cole nas mesas, entrada, telão, convites.
2. **Durante**:
   - Convidados escaneiam → vão pra `/`.
   - "Entrar no Mural" → `/wall` (vê tudo ao vivo).
   - "Enviar foto" → `/upload` (compressão automática).
   - Em um notebook conectado à TV, abra `/slideshow` (toque na tela para pausar).
3. **Depois**:
   - Use `/admin` pra revisar, destacar, esconder ou excluir fotos.
   - Para exportar tudo: baixe o bucket `photos` pelo dashboard do Supabase.

---

## Personalização visual

Cores e fontes vivem em [`app/globals.css`](app/globals.css) (vars CSS no `:root`)
e em [`app/layout.tsx`](app/layout.tsx) (Playfair Display + Inter via `next/font`).
A maior parte dos efeitos é alcançada via classes utilitárias:
`.glass`, `.glass-dark`, `.glow-rose`, `.text-gradient`, `.btn-primary`, `.btn-ghost`,
`.pulse-rose`, `.animate-float-up`, `.skeleton`, `.sparkle`, `.masonry`.

Para trocar a aniversariante e frases **sem mexer em código**, use as variáveis
`NEXT_PUBLIC_BIRTHDAY_NAME`, `NEXT_PUBLIC_TAGLINE`, `NEXT_PUBLIC_SUBTITLE`,
`NEXT_PUBLIC_HASHTAG`.

---

## Estrutura de pastas

```
mural-15-anos/
├── app/
│   ├── layout.tsx           # Fontes + Navbar + Sparkles
│   ├── page.tsx             # Landing (hero + contador + preview)
│   ├── globals.css          # Tema rosa/lilás/dourado + glassmorphism
│   ├── wall/page.tsx        # Suspense wrapper → Wall (client)
│   ├── upload/page.tsx      # UploadForm
│   ├── slideshow/
│   │   ├── layout.tsx       # Wrapper
│   │   └── page.tsx         # Slideshow (client) fullscreen
│   ├── admin/
│   │   ├── page.tsx         # Login ou Dashboard
│   │   └── actions.ts       # Server Actions (login/logout/delete/featured)
│   └── api/qrcode/route.ts  # PNG do QR Code
├── components/
│   ├── Navbar.tsx
│   ├── Sparkles.tsx
│   ├── Wall.tsx             # Masonry + realtime + lightbox trigger
│   ├── Lightbox.tsx         # Modal fullscreen com swipe e teclas
│   ├── UploadForm.tsx       # Compressão + drag-drop + progresso
│   ├── Slideshow.tsx        # Carrossel auto + KBD shortcuts
│   ├── AdminLogin.tsx
│   ├── AdminDashboard.tsx
│   ├── QrButton.tsx
│   └── Toast.tsx
├── lib/
│   ├── config.ts            # Nome/frases/limites
│   ├── types.ts             # Tipos do banco
│   └── supabase/
│       ├── client.ts        # browserClient (null-safe se sem env)
│       └── server.ts        # serverClient + adminClient (service_role)
└── supabase/
    └── schema.sql           # Tudo que precisa rodar no dashboard
```

---

## Roadmap (Fase 2/3 do PRD)

- [ ] Curtidas via `photo_likes` (schema já existe)
- [ ] Reações emoji
- [ ] Música ambiente no slideshow
- [ ] Download em ZIP no admin
- [ ] IA de destaques automáticos
- [ ] Captcha opcional anti-spam

---

## Atalhos de teclado

- **Lightbox** (`/wall`): `Esc` fecha, `←/→` navega
- **Slideshow** (`/slideshow`): `␣` pausa, `←/→` navega, `F` fullscreen, clique pausa
