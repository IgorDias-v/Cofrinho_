-- Cofrinho — schema (tabelas, enums, checks, índices, triggers de updated_at)
-- Toda linha pertence a um usuário de auth.users e some em cascata quando a conta é apagada.
-- Valores em reais: numeric(12,2). Datas: timestamptz.

/* ───────────── Enums ───────────── */
-- Domínios fechados e estáveis viram enum: aparecem tipados no supabase-js (database.types.ts) e no Prisma.
create type public.category      as enum ('moradia', 'alimentacao', 'transporte', 'lazer', 'assinaturas', 'outros');
create type public.payment_method as enum ('pix', 'dinheiro', 'card');
create type public.card_color    as enum ('ciano', 'lima', 'menta');
create type public.tx_source     as enum ('manual', 'fatura');
create type public.goal_icon     as enum ('plane', 'shield', 'book', 'car', 'target');
create type public.import_status as enum ('enviada', 'lida', 'importada', 'erro');

/* ───────────── updated_at automático ───────────── */
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

/* ───────────── profiles (1 por usuário) ───────────── */
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  name            text not null default '' check (char_length(name) <= 40),
  month_cap       numeric(12,2) not null default 0 check (month_cap >= 0),  -- 0 = sem teto do mês
  hide_balance    boolean not null default false,
  opening_balance numeric(12,2) not null default 0,                         -- saldo antes do app (pode ser negativo)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Cria o perfil no cadastro. security definer porque roda no contexto do Auth (supabase_auth_admin).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 40))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ───────────── cards ───────────── */
create table public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  nickname     text not null check (char_length(btrim(nickname)) between 1 and 20),
  last4        text not null check (last4 ~ '^[0-9]{4}$'),
  color        public.card_color not null default 'ciano',
  credit_limit numeric(12,2) not null check (credit_limit >= 0),        -- "limit" no front (palavra reservada no SQL/PostgREST)
  fatura_base  numeric(12,2) not null default 0 check (fatura_base >= 0),
  due_in_days  smallint not null default 10 check (due_in_days between 1 and 60),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint cards_id_user_key unique (id, user_id)                     -- alvo das FKs compostas (impede cruzar usuários)
);
create unique index cards_user_nickname_key on public.cards (user_id, lower(btrim(nickname)));

/* ───────────── invoice_imports (fatura enviada) ───────────── */
create table public.invoice_imports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  card_id       uuid,
  file_path     text not null unique,                                   -- caminho no bucket "faturas": {user_id}/arquivo
  file_name     text not null check (char_length(file_name) between 1 and 255),
  mime_type     text not null check (mime_type = 'application/pdf' or mime_type like 'image/%'),
  size_bytes    integer not null check (size_bytes > 0 and size_bytes <= 15728640),
  status        public.import_status not null default 'enviada',
  total         numeric(12,2) check (total >= 0),
  due_in_days   smallint check (due_in_days between 1 and 60),
  items_count   integer not null default 0 check (items_count >= 0),
  error_message text check (char_length(error_message) <= 500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint invoice_imports_id_user_key unique (id, user_id),
  constraint invoice_imports_path_owner check (split_part(file_path, '/', 1) = user_id::text),
  constraint invoice_imports_card_fkey foreign key (card_id, user_id)
    references public.cards (id, user_id) on delete set null (card_id)
);
create index invoice_imports_user_created_idx on public.invoice_imports (user_id, created_at desc);
create index invoice_imports_card_idx on public.invoice_imports (card_id, user_id) where card_id is not null;

/* ───────────── transactions ───────────── */
create table public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  category   public.category not null,
  method     public.payment_method not null,
  card_id    uuid,
  amount     numeric(12,2) not null check (amount > 0),
  income     boolean not null default false,
  source     public.tx_source not null default 'manual',
  date       timestamptz not null default now(),
  import_id  uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 'card' exige cartão; 'pix'/'dinheiro' não têm cartão
  constraint transactions_method_card check ((method = 'card') = (card_id is not null)),
  -- FKs compostas: o cartão e a importação precisam ser do mesmo usuário
  constraint transactions_card_fkey foreign key (card_id, user_id)
    references public.cards (id, user_id) on delete set null (card_id),
  constraint transactions_import_fkey foreign key (import_id, user_id)
    references public.invoice_imports (id, user_id) on delete set null (import_id)
);
create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_card_idx on public.transactions (card_id, user_id) where card_id is not null;
create index transactions_import_idx on public.transactions (import_id, user_id) where import_id is not null;

-- Apagar o cartão mantém as compras: o FK zera card_id e este trigger troca o método para 'dinheiro'
-- (BEFORE UPDATE roda antes do check transactions_method_card).
create function public.tx_card_removed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.card_id is null and old.card_id is not null and new.method = 'card' then
    new.method := 'dinheiro';
  end if;
  return new;
end $$;

create trigger transactions_card_removed
  before update of card_id on public.transactions
  for each row execute function public.tx_card_removed();

/* ───────────── budgets (teto por categoria) ───────────── */
create table public.budgets (
  user_id    uuid not null references auth.users (id) on delete cascade,
  category   public.category not null,
  cap        numeric(12,2) not null check (cap >= 0),                   -- 0 = sem teto
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

/* ───────────── goals (objetivos) ───────────── */
create table public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 30),
  saved      numeric(12,2) not null default 0 check (saved >= 0),
  target     numeric(12,2) not null check (target > 0),
  due        text check (char_length(due) <= 20),                       -- texto livre, ex.: "Dez 2027"
  icon       public.goal_icon not null default 'target',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_id_user_key unique (id, user_id)
);
create index goals_user_idx on public.goals (user_id, created_at);

/* ───────────── goal_movements (guardar / retirar) ───────────── */
-- amount > 0 = guardou (sai do saldo) · amount < 0 = retirou (volta ao saldo)
create table public.goal_movements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  goal_id    uuid not null,
  amount     numeric(12,2) not null check (amount <> 0),
  date       timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_movements_goal_fkey foreign key (goal_id, user_id)
    references public.goals (id, user_id) on delete cascade
);
create index goal_movements_goal_date_idx on public.goal_movements (goal_id, user_id, date desc);
create index goal_movements_user_date_idx on public.goal_movements (user_id, date desc);

/* ───────────── updated_at ───────────── */
create trigger profiles_touch        before update on public.profiles        for each row execute function public.touch_updated_at();
create trigger cards_touch           before update on public.cards           for each row execute function public.touch_updated_at();
create trigger invoice_imports_touch before update on public.invoice_imports for each row execute function public.touch_updated_at();
create trigger transactions_touch    before update on public.transactions    for each row execute function public.touch_updated_at();
create trigger budgets_touch         before update on public.budgets         for each row execute function public.touch_updated_at();
create trigger goals_touch           before update on public.goals           for each row execute function public.touch_updated_at();
create trigger goal_movements_touch  before update on public.goal_movements  for each row execute function public.touch_updated_at();

/* ───────────── funções internas: ninguém chama direto ───────────── */
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user()  from public, anon, authenticated;
revoke all on function public.tx_card_removed()  from public, anon, authenticated;

-- Rollback:
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop table if exists public.goal_movements, public.goals, public.budgets, public.transactions,
--   public.invoice_imports, public.cards, public.profiles cascade;
-- drop function if exists public.tx_card_removed(), public.handle_new_user(), public.touch_updated_at();
-- drop type if exists public.import_status, public.goal_icon, public.tx_source, public.card_color,
--   public.payment_method, public.category;
