-- Cofrinho — Storage: bucket privado "faturas" (PDF ou foto da fatura, até 15 MB)
-- Caminho obrigatório: {auth.uid()}/{nome-do-arquivo}. Cada pessoa só lê, envia, substitui e apaga na própria pasta.
-- Leitura pelo front: createSignedUrl (bucket privado, sem URL pública).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'faturas', 'faturas', false, 15728640,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy faturas_select on storage.objects for select to authenticated
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_update on storage.objects for update to authenticated
  using      (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy faturas_delete on storage.objects for delete to authenticated
  using (bucket_id = 'faturas' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Rollback (esvazie o bucket antes pela API/Dashboard; SQL não apaga arquivos do Storage):
-- drop policy if exists faturas_select on storage.objects;
-- drop policy if exists faturas_insert on storage.objects;
-- drop policy if exists faturas_update on storage.objects;
-- drop policy if exists faturas_delete on storage.objects;
-- delete from storage.buckets where id = 'faturas';
