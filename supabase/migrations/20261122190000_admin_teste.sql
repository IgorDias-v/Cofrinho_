-- Cofrinho — usuário administrador de TESTE (temporário)
-- E-mail: igorndias@gmail.com · senha provisória definida pelo dono do projeto (trocar depois).
-- O papel fica em raw_app_meta_data.role = 'admin': app_metadata não pode ser alterado
-- pelo próprio usuário (só pelo service role), então é seguro para checar permissão.
-- Idempotente: se o e-mail já existir, só garante o papel de admin.

/* Lê o papel do JWT da sessão atual. Usar em policies: `using (public.is_admin())`. */
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

grant execute on function public.is_admin() to authenticated;

do $$
declare
  v_email constant text := 'igorndias@gmail.com';
  v_uid   uuid;
begin
  select id into v_uid from auth.users where email = v_email;

  if v_uid is not null then
    update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
     where id = v_uid;
    raise notice 'Usuário já existe; papel admin garantido.';
    return;
  end if;

  v_uid := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, last_sign_in_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    v_email, extensions.crypt('1409', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{"name":"Igor","email_verified":true}'::jsonb,
    now(), now(), null,
    '', '', '', '', '', '', '', '',
    false, false
  );

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), v_uid, v_uid::text, 'email',
    jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    null, now(), now()
  );
end $$;
