-- Hardening lanjutan (temuan review):
-- 1. Signup tidak boleh bisa injeksi role 'admin' lewat user_metadata.
-- 2. User tidak boleh bisa mengubah kolom role di profiles (self-escalation).
-- 3. Bucket storage diberi batas ukuran & MIME type.
-- 4. Owner boleh mengajukan ulang outlet yang ditolak (rejected -> pending).

-- ============ 1. SANITASI ROLE SAAT SIGNUP ============
-- Sebelumnya role diambil mentah dari raw_user_meta_data sehingga siapa pun
-- yang memanggil API signup bisa mendaftar sebagai 'admin'.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case
      when requested_role in ('user', 'owner') then requested_role::public.user_role
      else 'user'::public.user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- ============ 2. GUARD KOLOM ROLE DI PROFILES ============
-- Policy UPDATE profiles mengizinkan user meng-update baris miliknya tanpa
-- pembatasan kolom, sehingga role bisa diubah sendiri menjadi 'admin'.
create or replace function public.enforce_profile_role()
returns trigger as $$
begin
  -- Service role (auth.uid() null) dan admin bebas mengubah role.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Hanya admin yang dapat mengubah role akun';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_role_guard
before update on public.profiles
for each row execute function public.enforce_profile_role();

-- ============ 3. BATAS UKURAN & MIME BUCKET ============
update storage.buckets
set file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'photos';

update storage.buckets
set file_size_limit = 10485760, -- 10MB (gambar equirectangular besar)
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'panoramas';

update storage.buckets
set file_size_limit = 10485760, -- 10MB
    allowed_mime_types = array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/aac']
where id = 'audio';

-- ============ 4. OWNER BOLEH RESUBMIT OUTLET REJECTED ============
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
    -- Satu-satunya transisi yang boleh dilakukan owner: mengajukan ulang
    -- outlet yang ditolak untuk ditinjau kembali.
    if old.status = 'rejected' and new.status = 'pending' and new.owner_id = auth.uid() then
      return new;
    end if;
    raise exception 'Hanya admin yang dapat mengubah status outlet';
  end if;

  return new;
end;
$$ language plpgsql security definer;
