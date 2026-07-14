-- Review tampil langsung (post-moderation): admin hanya memantau dan
-- menyembunyikan/menghapus review yang tidak pantas setelahnya.

-- Default status baru + komentar boleh kosong (review bintang saja).
alter table public.reviews
  alter column status set default 'approved';

alter table public.reviews
  alter column comment set default '';

-- Backfill: review lama yang masih antre moderasi langsung ditayangkan.
update public.reviews
  set status = 'approved'
  where status = 'pending';
