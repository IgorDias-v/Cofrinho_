-- Cofrinho — remove SÓ a conta de demonstração (lucas@cofrinho.app) e tudo que é dela.
-- Rodar no SQL Editor do Supabase (como postgres) quando a demo não for mais necessária.
-- Apagar de auth.users leva junto, em cascata: auth.identities, sessões, profiles, cards, transactions,
-- budgets, goals, goal_movements e invoice_imports da demo. Nenhum outro usuário é tocado.
--
-- Arquivos no Storage (bucket "faturas", pasta c0f1d000-0000-4000-8000-00000000d3e0/) NÃO são apagados por SQL:
-- a demo não tem arquivos no seed; se alguém enviou uma fatura com a conta demo, apague a pasta pelo Dashboard
-- (Storage → faturas) ou pela API antes de rodar este script.
--
-- Observação: a migration 20261122170955_seed_demo continua registrada; ela é idempotente e só recria a demo
-- se for reaplicada num banco novo (supabase db reset). Para não recriar, remova esse arquivo de supabase/migrations.

begin;

delete from auth.users
 where id = 'c0f1d000-0000-4000-8000-00000000d3e0'
   and email = 'lucas@cofrinho.app';

-- conferência: tudo deve dar 0
select
  (select count(*) from auth.users         where email = 'lucas@cofrinho.app')                    as usuarios_demo,
  (select count(*) from public.profiles     where id      = 'c0f1d000-0000-4000-8000-00000000d3e0') as perfis,
  (select count(*) from public.cards        where user_id = 'c0f1d000-0000-4000-8000-00000000d3e0') as cartoes,
  (select count(*) from public.transactions where user_id = 'c0f1d000-0000-4000-8000-00000000d3e0') as lancamentos,
  (select count(*) from public.goals        where user_id = 'c0f1d000-0000-4000-8000-00000000d3e0') as metas;

commit;
