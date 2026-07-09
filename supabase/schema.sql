-- ============================================================
-- VERSOS QUE IMPACTAN — Esquema de Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.
-- ============================================================

-- Tabla de proyectos de video (historial en la nube por usuario)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'ready' check (status in ('draft', 'generating', 'ready', 'error')),
  topic text not null,
  custom_message text,
  manual_verse text,
  manual_reference text,
  duration_sec numeric not null check (duration_sec between 10 and 120),
  script jsonb not null,          -- { verse, reference, message, fullText }
  voice_id text not null,
  text_style text not null,
  background_query text not null,
  include_avatar boolean not null default false,
  watermark jsonb not null,       -- { enabled, handle, networks }
  assets jsonb not null default '{}'::jsonb  -- urls de audio/fondo/avatar/render + wordTimings
);

create index if not exists projects_user_created_idx
  on public.projects (user_id, created_at desc);

-- Row Level Security: cada usuario solo ve sus videos
alter table public.projects enable row level security;

create policy "usuarios leen sus proyectos"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus proyectos"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "usuarios actualizan sus proyectos"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "usuarios borran sus proyectos"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Storage: bucket público "media" para audio de voz, renders y música
-- (público para que D-ID pueda leer el mp3 de la voz)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "lectura pública de media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "el servicio escribe media"
  on storage.objects for insert
  with check (bucket_id = 'media');

create policy "el servicio actualiza media"
  on storage.objects for update
  using (bucket_id = 'media');
