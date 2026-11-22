-- Cofrinho — dados de demonstração (espelha src/lib/data.ts)
-- Conta demo: lucas@cofrinho.app (senha de demonstração já pública em src/lib/data.ts).
-- Para remover só a demo: supabase/seed/remover_dados_demo.sql
-- Idempotente: se a conta demo já existir, não faz nada.
-- Datas: "mês atual" no fuso America/Sao_Paulo NO MOMENTO em que a migration rodou (dia limitado a hoje, como dayOfMonth()).

do $$
declare
  v_uid       constant uuid := 'c0f1d000-0000-4000-8000-00000000d3e0';  -- id fixo da conta demo
  v_tz        constant text := 'America/Sao_Paulo';
  v_month     timestamp     := date_trunc('month', now() at time zone v_tz);
  v_today     int           := extract(day from now() at time zone v_tz)::int;
  v_viagem    uuid;
  v_salario   uuid;
  v_principal uuid;
  v_japao     uuid;
  v_reserva   uuid;
  v_curso     uuid;
begin
  if exists (select 1 from auth.users where id = v_uid or email = 'lucas@cofrinho.app') then
    raise notice 'Conta demo já existe; seed ignorado.';
    return;
  end if;

  /* ── Usuário (auth.users + auth.identities), e-mail já confirmado ── */
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, last_sign_in_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'lucas@cofrinho.app', extensions.crypt('cofrinho123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Lucas","email_verified":true}'::jsonb,
    now(), now(), null,
    '', '', '', '', '', '', '', '',
    false, false
  );

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), v_uid, v_uid::text, 'email',
    jsonb_build_object('sub', v_uid::text, 'email', 'lucas@cofrinho.app', 'email_verified', true, 'phone_verified', false),
    null, now(), now()
  );

  /* ── Perfil (criado pelo trigger on_auth_user_created) ──
     Saldo inicial = 14.500 − (entradas − gastos) = 14.500 − (6.200 − 2.340) = 10.640 → Home abre em R$ 14.500. */
  update public.profiles
     set name = 'Lucas', month_cap = 3200, hide_balance = false, opening_balance = 10640
   where id = v_uid;

  /* ── Cartões (fatura_base = fatura de referência − compras do mês no cartão) ── */
  insert into public.cards (user_id, nickname, last4, color, credit_limit, fatura_base, due_in_days)
  values (v_uid, 'Viagem', '1180', 'lima', 1225, 98.00, 27) returning id into v_viagem;
  insert into public.cards (user_id, nickname, last4, color, credit_limit, fatura_base, due_in_days)
  values (v_uid, 'Salário', '6917', 'menta', 2460, 194.40, 12) returning id into v_salario;   -- 640 − 445,60
  insert into public.cards (user_id, nickname, last4, color, credit_limit, fatura_base, due_in_days)
  values (v_uid, 'Principal', '4552', 'ciano', 2986, 289.60, 8) returning id into v_principal; -- 1284 − 994,40

  /* ── Lançamentos do mês atual ── */
  insert into public.transactions (user_id, name, category, method, card_id, amount, income, source, date)
  select v_uid, t.name, t.category::public.category, t.method::public.payment_method,
         case t.card when 'principal' then v_principal when 'salario' then v_salario end,
         t.amount, t.income, 'manual',
         (v_month + make_interval(days => least(t.day, v_today) - 1, hours => t.hour)) at time zone v_tz
    from (values
      ('Salário',         'outros',      'pix',  null,        5,  6200.00, true,  9),
      ('Aluguel',         'moradia',     'pix',  null,        5,   900.00, false, 10),
      ('Mercado',         'alimentacao', 'card', 'principal', 31,  182.40, false, 18),
      ('iFood',           'alimentacao', 'card', 'salario',   20,  157.60, false, 20),
      ('Rappi',           'alimentacao', 'card', 'principal', 14,  140.00, false, 21),
      ('Uber',            'transporte',  'card', 'principal', 19,   32.00, false, 8),
      ('Combustível',     'transporte',  'card', 'salario',   11,  288.00, false, 17),
      ('Cinema e jantar', 'lazer',       'card', 'principal', 15,  300.00, false, 22),
      ('Netflix',         'assinaturas', 'card', 'principal', 30,   55.90, false, 7),
      ('Spotify',         'assinaturas', 'card', 'principal', 8,    34.90, false, 7),
      ('iCloud',          'assinaturas', 'card', 'principal', 8,    14.90, false, 7),
      ('Academia',        'assinaturas', 'card', 'principal', 2,   129.90, false, 7),
      ('YouTube Premium', 'assinaturas', 'card', 'principal', 3,    24.90, false, 7),
      ('Disney+',         'assinaturas', 'card', 'principal', 4,    79.50, false, 7)
    ) as t(name, category, method, card, day, amount, income, hour);

  /* ── Tetos por categoria ── */
  insert into public.budgets (user_id, category, cap) values
    (v_uid, 'alimentacao', 774),
    (v_uid, 'moradia',     900),
    (v_uid, 'transporte',  800),
    (v_uid, 'lazer',       385);

  /* ── Metas ── */
  insert into public.goals (user_id, name, saved, target, due, icon)
  values (v_uid, 'Viagem ao Japão', 13600, 20000, 'Dez 2027', 'plane') returning id into v_japao;
  insert into public.goals (user_id, name, saved, target, due, icon)
  values (v_uid, 'Reserva', 7200, 10000, null, 'shield') returning id into v_reserva;
  insert into public.goals (user_id, name, saved, target, due, icon)
  values (v_uid, 'Curso', 2700, 3000, null, 'book') returning id into v_curso;
  insert into public.goals (user_id, name, saved, target, due, icon)
  values (v_uid, 'Carro novo', 9600, 40000, null, 'car');

  /* ── Movimentos (histórico; já contados em goals.saved, por isso entram direto, sem RPC) ── */
  insert into public.goal_movements (user_id, goal_id, amount, date) values
    (v_uid, v_japao,    500, now() - interval '2 days'),
    (v_uid, v_japao,   1000, now() - interval '12 days'),
    (v_uid, v_japao,   -300, now() - interval '20 days'),
    (v_uid, v_reserva,  400, now() - interval '5 days'),
    (v_uid, v_curso,    250, now() - interval '9 days');
end $$;

-- Rollback: rodar supabase/seed/remover_dados_demo.sql (apaga a conta demo e, em cascata, todos os dados dela).
