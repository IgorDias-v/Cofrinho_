-- Cofrinho — Row Level Security e grants
-- Regra: cada pessoa logada (role authenticated) só vê e altera as próprias linhas.
-- anon não recebe grant nem policy. (select auth.uid()) é avaliado uma vez por query (initPlan), não por linha.

/* ───────────── Grants mínimos ───────────── */
revoke all on table public.profiles, public.cards, public.invoice_imports, public.transactions,
                    public.budgets, public.goals, public.goal_movements
  from public, anon, authenticated;

grant select, insert, update         on table public.profiles to authenticated;  -- apagar = apagar a conta
grant select, insert, update, delete on table public.cards, public.invoice_imports, public.transactions,
                                              public.budgets, public.goals, public.goal_movements
  to authenticated;

-- Tabelas e funções criadas no futuro em public não ganham acesso de anon automaticamente.
alter default privileges for role postgres in schema public revoke all on tables    from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke execute on functions from anon, public;

/* ───────────── RLS ligado em tudo ───────────── */
alter table public.profiles        enable row level security;
alter table public.cards           enable row level security;
alter table public.invoice_imports enable row level security;
alter table public.transactions    enable row level security;
alter table public.budgets         enable row level security;
alter table public.goals           enable row level security;
alter table public.goal_movements  enable row level security;

/* ───────────── profiles ───────────── */
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- sem policy de delete: o perfil some em cascata quando a conta (auth.users) é apagada.

/* ───────────── cards ───────────── */
create policy cards_select on public.cards for select to authenticated
  using (user_id = (select auth.uid()));
create policy cards_insert on public.cards for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy cards_update on public.cards for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cards_delete on public.cards for delete to authenticated
  using (user_id = (select auth.uid()));

/* ───────────── invoice_imports ───────────── */
create policy invoice_imports_select on public.invoice_imports for select to authenticated
  using (user_id = (select auth.uid()));
create policy invoice_imports_insert on public.invoice_imports for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy invoice_imports_update on public.invoice_imports for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy invoice_imports_delete on public.invoice_imports for delete to authenticated
  using (user_id = (select auth.uid()));

/* ───────────── transactions ───────────── */
create policy transactions_select on public.transactions for select to authenticated
  using (user_id = (select auth.uid()));
create policy transactions_insert on public.transactions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy transactions_update on public.transactions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy transactions_delete on public.transactions for delete to authenticated
  using (user_id = (select auth.uid()));

/* ───────────── budgets ───────────── */
create policy budgets_select on public.budgets for select to authenticated
  using (user_id = (select auth.uid()));
create policy budgets_insert on public.budgets for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy budgets_update on public.budgets for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy budgets_delete on public.budgets for delete to authenticated
  using (user_id = (select auth.uid()));

/* ───────────── goals ───────────── */
create policy goals_select on public.goals for select to authenticated
  using (user_id = (select auth.uid()));
create policy goals_insert on public.goals for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy goals_update on public.goals for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy goals_delete on public.goals for delete to authenticated
  using (user_id = (select auth.uid()));

/* ───────────── goal_movements ───────────── */
-- O front deve escrever por RPC (save_goal_movement / delete_goal_movement) para manter saldo e meta juntos.
create policy goal_movements_select on public.goal_movements for select to authenticated
  using (user_id = (select auth.uid()));
create policy goal_movements_insert on public.goal_movements for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy goal_movements_update on public.goal_movements for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy goal_movements_delete on public.goal_movements for delete to authenticated
  using (user_id = (select auth.uid()));

-- Rollback:
-- drop policy if exists profiles_select on public.profiles; (… e as demais policies acima, uma a uma)
-- alter table public.<tabela> disable row level security;  -- NÃO faça isso em produção com dados reais
-- alter default privileges for role postgres in schema public grant all on tables to anon;
-- alter default privileges for role postgres in schema public grant all on sequences to anon;
-- alter default privileges for role postgres in schema public grant execute on functions to anon, public;
-- grant all on table public.profiles, public.cards, public.invoice_imports, public.transactions,
--   public.budgets, public.goals, public.goal_movements to anon, authenticated;  -- volta ao padrão do Supabase
