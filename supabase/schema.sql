-- ============================================================
-- Schema do Mural Compartilhado
-- Rode este script no SQL Editor do Supabase (Dashboard).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tabela principal ----------
create table if not exists public.photos (
  id              uuid primary key default gen_random_uuid(),
  storage_path    text not null,            -- ex: 'photos/2026/03/abc.jpg'
  image_url       text not null,            -- URL pública gerada
  thumbnail_url   text,                     -- mesma URL (Supabase Image Transform)
  uploader_name   text,                     -- opcional, sem login
  caption         text,
  mime_type       text not null,
  file_size       bigint,
  width           int,
  height          int,
  is_video        boolean not null default false,
  approved        boolean not null default true,   -- pré-aprovado por padrão
  featured        boolean not null default false,
  likes_count     int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_approved_idx   on public.photos (approved, created_at desc);
create index if not exists photos_featured_idx   on public.photos (featured) where featured = true;

-- ---------- Likes (opcional, sem login → contagem agregada) ----------
create table if not exists public.photo_likes (
  id          uuid primary key default gen_random_uuid(),
  photo_id    uuid not null references public.photos(id) on delete cascade,
  device_id   text not null,
  created_at  timestamptz not null default now(),
  unique (photo_id, device_id)
);

create or replace function public.bump_likes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.photos set likes_count = likes_count + 1 where id = new.photo_id;
  elsif (tg_op = 'DELETE') then
    update public.photos set likes_count = greatest(0, likes_count - 1) where id = old.photo_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_bump_likes on public.photo_likes;
create trigger trg_bump_likes
  after insert or delete on public.photo_likes
  for each row execute function public.bump_likes();

-- ---------- Row Level Security ----------
alter table public.photos       enable row level security;
alter table public.photo_likes  enable row level security;

-- Leitura pública (qualquer um vê fotos aprovadas)
drop policy if exists "photos_public_read" on public.photos;
create policy "photos_public_read"
  on public.photos for select
  using (approved = true);

-- Insert anônimo: qualquer um pode enviar (validação no client + storage policy)
drop policy if exists "photos_public_insert" on public.photos;
create policy "photos_public_insert"
  on public.photos for insert
  with check (true);

-- Update/Delete só via service-role (admin). RLS bloqueia o resto.

-- Likes públicos
drop policy if exists "likes_public_read"   on public.photo_likes;
drop policy if exists "likes_public_insert" on public.photo_likes;
drop policy if exists "likes_public_delete" on public.photo_likes;

create policy "likes_public_read"
  on public.photo_likes for select using (true);
create policy "likes_public_insert"
  on public.photo_likes for insert with check (true);
create policy "likes_public_delete"
  on public.photo_likes for delete using (true);

-- ---------- Realtime ----------
-- Publicar a tabela photos no canal realtime
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.photo_likes;

-- ============================================================
-- Storage Bucket
-- ============================================================
-- Crie pelo Dashboard ou rode (requer service_role):
--   insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
--
-- Policies para o bucket 'photos':

drop policy if exists "photos_bucket_public_read"   on storage.objects;
drop policy if exists "photos_bucket_public_insert" on storage.objects;

create policy "photos_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "photos_bucket_public_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and (octet_length(coalesce(metadata->>'size','0')::int::text) >= 0) -- placeholder, ajuste se quiser
  );

-- Update/Delete no bucket: somente service_role (não cria policy → bloqueia).
