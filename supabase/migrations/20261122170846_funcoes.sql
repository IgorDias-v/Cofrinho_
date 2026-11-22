-- Cofrinho — funções RPC (supabase.rpc(...))
-- Todas: security invoker (respeitam RLS de quem chama), search_path vazio, execute só para authenticated.
-- Cada chamada é uma transação: saldo (profiles.opening_balance), meta (goals.saved) e movimento mudam juntos ou nada muda.
-- Erros de regra usam SQLSTATE P0001 com mensagem em português para mostrar no front.

/* ───────────── Guardar / retirar / editar movimento ───────────── */
-- p_amount > 0 guarda (sai do saldo), < 0 retira (volta ao saldo).
-- p_id nulo = novo movimento; preenchido = edição (aplica só a diferença; troca de meta também é tratada).
create function public.save_goal_movement(
  p_goal_id uuid,
  p_amount  numeric,
  p_date    timestamptz default null,
  p_id      uuid default null
)
returns public.goal_movements
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_old    public.goal_movements;
  v_saved  numeric;
  v_delta  numeric;
  v_result public.goal_movements;
begin
  if v_uid is null then
    raise exception 'É preciso entrar na conta.' using errcode = '42501';
  end if;
  if p_amount is null or p_amount = 0 then
    raise exception 'Digite um valor diferente de zero.' using errcode = 'P0001';
  end if;

  if p_id is not null then
    select * into v_old from public.goal_movements where id = p_id and user_id = v_uid for update;
    if not found then
      raise exception 'Movimento não encontrado.' using errcode = 'P0002';
    end if;
  end if;

  -- edição trocando de meta: desfaz na meta antiga primeiro
  if v_old.id is not null and v_old.goal_id <> p_goal_id then
    select saved into v_saved from public.goals where id = v_old.goal_id and user_id = v_uid for update;
    if v_saved - v_old.amount < 0 then
      raise exception 'A meta antiga não tem guardado suficiente para desfazer este movimento.' using errcode = 'P0001';
    end if;
    update public.goals set saved = saved - v_old.amount where id = v_old.goal_id and user_id = v_uid;
    v_delta := p_amount;
  else
    v_delta := p_amount - coalesce(v_old.amount, 0);
  end if;

  select saved into v_saved from public.goals where id = p_goal_id and user_id = v_uid for update;
  if not found then
    raise exception 'Meta não encontrada.' using errcode = 'P0002';
  end if;
  if v_saved + v_delta < 0 then
    raise exception 'Valor maior que o guardado na meta.' using errcode = 'P0001';
  end if;
  update public.goals set saved = saved + v_delta where id = p_goal_id and user_id = v_uid;

  -- o saldo muda pela diferença total de dinheiro guardado
  update public.profiles
     set opening_balance = opening_balance - (p_amount - coalesce(v_old.amount, 0))
   where id = v_uid;

  if v_old.id is null then
    insert into public.goal_movements (user_id, goal_id, amount, date)
    values (v_uid, p_goal_id, p_amount, coalesce(p_date, now()))
    returning * into v_result;
  else
    update public.goal_movements
       set goal_id = p_goal_id, amount = p_amount, date = coalesce(p_date, v_old.date)
     where id = v_old.id
    returning * into v_result;
  end if;

  return v_result;
end $$;

/* ───────────── Apagar movimento (desfaz) ───────────── */
-- Retorna a linha apagada, ou null se não existir (o front trata como já apagado).
create function public.delete_goal_movement(p_id uuid)
returns public.goal_movements
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_m     public.goal_movements;
  v_saved numeric;
begin
  if v_uid is null then
    raise exception 'É preciso entrar na conta.' using errcode = '42501';
  end if;

  select * into v_m from public.goal_movements where id = p_id and user_id = v_uid for update;
  if not found then
    return null;
  end if;

  select saved into v_saved from public.goals where id = v_m.goal_id and user_id = v_uid for update;
  if v_saved - v_m.amount < 0 then
    raise exception 'Não dá para apagar: o valor já foi retirado da meta. Apague as retiradas antes.' using errcode = 'P0001';
  end if;

  update public.goals    set saved = saved - v_m.amount                     where id = v_m.goal_id and user_id = v_uid;
  update public.profiles set opening_balance = opening_balance + v_m.amount where id = v_uid;
  delete from public.goal_movements where id = v_m.id;

  return v_m;
end $$;

/* ───────────── Apagar meta (devolve o guardado ao saldo) ───────────── */
-- Retorna o valor devolvido ao saldo, ou null se a meta não existir. Movimentos somem em cascata.
create function public.delete_goal(p_id uuid)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_g   public.goals;
begin
  if v_uid is null then
    raise exception 'É preciso entrar na conta.' using errcode = '42501';
  end if;

  delete from public.goals where id = p_id and user_id = v_uid returning * into v_g;
  if not found then
    return null;
  end if;

  update public.profiles set opening_balance = opening_balance + v_g.saved where id = v_uid;
  return v_g.saved;
end $$;

/* ───────────── Importar lançamentos de uma fatura ───────────── */
-- p_items: [{ "name": text, "amount": number, "category": category }, ...]  (FaturaItem do front)
-- Cria os lançamentos (source = 'fatura') e marca a importação como 'importada', tudo junto.
-- p_card_id nulo = lançamentos em 'dinheiro'. Retorna quantos lançamentos foram criados.
create function public.import_invoice(
  p_import_id uuid,
  p_items     jsonb,
  p_card_id   uuid default null,
  p_date      timestamptz default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'É preciso entrar na conta.' using errcode = '42501';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Nenhum lançamento para importar.' using errcode = 'P0001';
  end if;

  perform 1 from public.invoice_imports where id = p_import_id and user_id = v_uid for update;
  if not found then
    raise exception 'Importação não encontrada.' using errcode = 'P0002';
  end if;

  insert into public.transactions (user_id, name, category, method, card_id, amount, income, source, date, import_id)
  select v_uid,
         left(btrim(i ->> 'name'), 40),
         (i ->> 'category')::public.category,
         case when p_card_id is null then 'dinheiro'::public.payment_method else 'card'::public.payment_method end,
         p_card_id,
         (i ->> 'amount')::numeric,
         false,
         'fatura',
         coalesce(p_date, now()),
         p_import_id
    from jsonb_array_elements(p_items) as i;
  get diagnostics v_count = row_count;

  update public.invoice_imports
     set status = 'importada',
         items_count = items_count + v_count,
         card_id = coalesce(p_card_id, card_id)
   where id = p_import_id and user_id = v_uid;

  return v_count;
end $$;

/* ───────────── Execução: só usuários logados ───────────── */
revoke all on function public.save_goal_movement(uuid, numeric, timestamptz, uuid) from public, anon;
revoke all on function public.delete_goal_movement(uuid)                           from public, anon;
revoke all on function public.delete_goal(uuid)                                    from public, anon;
revoke all on function public.import_invoice(uuid, jsonb, uuid, timestamptz)       from public, anon;
grant execute on function public.save_goal_movement(uuid, numeric, timestamptz, uuid) to authenticated;
grant execute on function public.delete_goal_movement(uuid)                           to authenticated;
grant execute on function public.delete_goal(uuid)                                    to authenticated;
grant execute on function public.import_invoice(uuid, jsonb, uuid, timestamptz)       to authenticated;

-- Rollback:
-- drop function if exists public.import_invoice(uuid, jsonb, uuid, timestamptz);
-- drop function if exists public.delete_goal(uuid);
-- drop function if exists public.delete_goal_movement(uuid);
-- drop function if exists public.save_goal_movement(uuid, numeric, timestamptz, uuid);
