-- Akses baca laporan per peran:
-- 1. Pemilik outlet dapat melihat laporan untuk outlet miliknya (feedback
--    langsung: jam buka salah, tutup permanen, dsb).
-- 2. Pelapor yang login dapat melacak status laporannya sendiri.
-- Update/resolve tetap khusus admin (kebijakan reports_update_admin).

create policy "reports_select_owner"
on public.reports
for select
using (
  exists (
    select 1 from public.outlets o
    where o.id = outlet_id and o.owner_id = auth.uid()
  )
);

create policy "reports_select_own"
on public.reports
for select
using (auth.uid() = user_id);
