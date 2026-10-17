-- ==============================================================================
-- SANCTUARY RPG — ESQUEMA DE BASE DE DADOS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Instruções de Execução:
-- 1. Aceda ao painel do Supabase: https://supabase.com/dashboard
-- 2. Selecione o seu projeto (ou crie um novo gratuitamente).
-- 3. No menu lateral esquerdo, clique em "SQL Editor".
-- 4. Cole este script completo e clique no botão verde "Run".
-- ==============================================================================

-- 1. Tabela Principal de Salvamento das Fichas e Estados do Santuário
create table if not exists public.sanctuary_saves (
  user_id text primary key,
  characters jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Comentários de documentação da tabela e colunas
comment on table public.sanctuary_saves is 'Armazena as fichas de personagens, estado tático, armas e inventário do Santuário';
comment on column public.sanctuary_saves.user_id is 'Identificador do utilizador ou conta de jogador (ex: CapMarcola ou UUID de Auth)';
comment on column public.sanctuary_saves.characters is 'Array completo de fichas com atributos, HP, tacticalState, munições e inventário';

-- 2. Habilitação de Row Level Security (RLS)
alter table public.sanctuary_saves enable row level security;

-- Remove políticas antigas para evitar conflitos na recriação
drop policy if exists "sanctuary_saves_select_all" on public.sanctuary_saves;
drop policy if exists "sanctuary_saves_insert_all" on public.sanctuary_saves;
drop policy if exists "sanctuary_saves_update_all" on public.sanctuary_saves;

-- 3. Políticas de Acesso RLS
-- Permite leitura de fichas tanto para utilizadores anónimos (chave anon) como autenticados
create policy "sanctuary_saves_select_all"
  on public.sanctuary_saves
  for select
  to anon, authenticated
  using (true);

-- Permite inserção de novos registos de utilizador
create policy "sanctuary_saves_insert_all"
  on public.sanctuary_saves
  for insert
  to anon, authenticated
  with check (true);

-- Permite atualização dos dados da ficha
create policy "sanctuary_saves_update_all"
  on public.sanctuary_saves
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 4. Função e Gatilho para Atualização Automática do campo updated_at
create or replace function public.handle_sanctuary_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_sanctuary_saves_updated_at on public.sanctuary_saves;
create trigger set_sanctuary_saves_updated_at
  before update on public.sanctuary_saves
  for each row
  execute function public.handle_sanctuary_updated_at();

-- 5. Armazenamento de Imagens (Supabase Storage Bucket)
-- Cria o bucket 'sanctuary-images' se ainda não existir
insert into storage.buckets (id, name, public)
values ('sanctuary-images', 'sanctuary-images', true)
on conflict (id) do update set public = true;

-- Remove políticas anteriores do storage para evitar duplicação
drop policy if exists "sanctuary_images_select_public" on storage.objects;
drop policy if exists "sanctuary_images_insert_public" on storage.objects;
drop policy if exists "sanctuary_images_update_public" on storage.objects;

-- Permite acesso público para visualização das imagens das fichas e armas
create policy "sanctuary_images_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'sanctuary-images');

-- Permite envio de novas fotos de personagens e itens
create policy "sanctuary_images_insert_public"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'sanctuary-images');

-- Permite atualização ou substituição de fotos
create policy "sanctuary_images_update_public"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'sanctuary-images');
