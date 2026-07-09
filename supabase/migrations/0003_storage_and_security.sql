-- Storage buckets + security hardening
-- 1. Buckets yang dipakai fitur upload (photos, panoramas, audio) — sebelumnya
--    tidak pernah dibuat di migrations sehingga semua upload gagal "Bucket not found".
-- 2. Guard status outlet: hanya admin yang boleh mengubah status; insert non-admin
--    selalu dipaksa 'pending' (mencegah owner self-approve lewat server action).
-- 3. Insert outlet hanya untuk akun dengan role owner/admin.

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public)
values
  ('photos', 'photos', true),
  ('panoramas', 'panoramas', true),
  ('audio', 'audio', true)
on conflict (id) do update set public = excluded.public;

-- Public read untuk bucket publik aplikasi
create policy "app_buckets_public_read"
on storage.objects for select
using (bucket_id in ('photos', 'panoramas', 'audio'));

-- Upload hanya oleh user login, ke folder miliknya sendiri (<uid>/...)
create policy "app_buckets_auth_insert_own_folder"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('photos', 'panoramas', 'audio')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "app_buckets_auth_update_own_folder"
on storage.objects for update to authenticated
using (
  bucket_id in ('photos', 'panoramas', 'audio')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('photos', 'panoramas', 'audio')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "app_buckets_auth_delete_own_folder"
on storage.objects for delete to authenticated
using (
  bucket_id in ('photos', 'panoramas', 'audio')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============ OUTLET STATUS GUARD ============
-- Server action & RLS tidak membatasi kolom status untuk owner; trigger ini
-- menutup celah self-approve di level database.
create or replace function public.enforce_outlet_status()
returns trigger as $$
begin
  -- Service role (auth.uid() is null) dan admin bebas mengatur status.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    raise exception 'Hanya admin yang dapat mengubah status outlet';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger outlets_status_guard
before insert or update on public.outlets
for each row execute function public.enforce_outlet_status();

-- ============ INSERT HANYA ROLE OWNER/ADMIN ============
drop policy "outlets_owner_insert" on public.outlets;

create policy "outlets_owner_insert"
on public.outlets
for insert
with check (
  (
    auth.uid() = owner_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('owner', 'admin')
    )
  )
  or public.is_admin()
);
