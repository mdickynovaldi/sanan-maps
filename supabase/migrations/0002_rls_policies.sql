-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.outlets enable row level security;
alter table public.outlet_categories enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.photos enable row level security;
alter table public.panoramas enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

-- Helper functions
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

create or replace function public.is_owner_of_outlet(outlet_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.outlets
    where id = outlet_uuid and owner_id = auth.uid()
  );
$$ language sql stable security definer;

-- PROFILES
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- CATEGORIES
create policy "categories_read_all"
on public.categories
for select
using (true);

create policy "categories_admin_all"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

-- OUTLETS
create policy "outlets_read_approved_public"
on public.outlets
for select
using (
  status = 'approved'
  or auth.uid() = owner_id
  or public.is_admin()
);

create policy "outlets_owner_insert"
on public.outlets
for insert
with check (
  auth.uid() = owner_id
  or public.is_admin()
);

create policy "outlets_owner_update_or_admin"
on public.outlets
for update
using (
  auth.uid() = owner_id
  or public.is_admin()
)
with check (
  auth.uid() = owner_id
  or public.is_admin()
);

create policy "outlets_admin_delete"
on public.outlets
for delete
using (public.is_admin());

-- OUTLET_CATEGORIES
create policy "outlet_categories_read_public"
on public.outlet_categories
for select
using (true);

create policy "outlet_categories_owner_or_admin"
on public.outlet_categories
for all
using (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
)
with check (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
);

-- PRODUCTS
create policy "products_read_from_approved_outlets"
on public.products
for select
using (
  exists (
    select 1 from public.outlets o
    where o.id = outlet_id
      and (o.status = 'approved' or o.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "products_owner_or_admin_manage"
on public.products
for all
using (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
)
with check (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
);

-- REVIEWS
create policy "reviews_read_approved_public"
on public.reviews
for select
using (
  status = 'approved'
  or user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.outlets o
    where o.id = outlet_id and o.owner_id = auth.uid()
  )
);

create policy "reviews_authenticated_insert"
on public.reviews
for insert
with check (auth.uid() = user_id);

create policy "reviews_update_own_or_admin"
on public.reviews
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "reviews_delete_own_or_admin"
on public.reviews
for delete
using (auth.uid() = user_id or public.is_admin());

-- PHOTOS
create policy "photos_read_public_approved_outlet"
on public.photos
for select
using (
  exists (
    select 1 from public.outlets o
    where o.id = outlet_id
      and (o.status = 'approved' or o.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "photos_owner_or_admin_manage"
on public.photos
for all
using (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
)
with check (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
);

-- PANORAMAS
create policy "panoramas_read_public_approved_outlet"
on public.panoramas
for select
using (
  exists (
    select 1 from public.outlets o
    where o.id = outlet_id
      and (o.status = 'approved' or o.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "panoramas_owner_or_admin_manage"
on public.panoramas
for all
using (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
)
with check (
  public.is_owner_of_outlet(outlet_id)
  or public.is_admin()
);

-- FAVORITES
create policy "favorites_select_own"
on public.favorites
for select
using (auth.uid() = user_id);

create policy "favorites_insert_own"
on public.favorites
for insert
with check (auth.uid() = user_id);

create policy "favorites_delete_own"
on public.favorites
for delete
using (auth.uid() = user_id);

-- REPORTS
create policy "reports_insert_authenticated_or_guest"
on public.reports
for insert
with check (auth.uid() = user_id or user_id is null);

create policy "reports_select_admin"
on public.reports
for select
using (public.is_admin());

create policy "reports_update_admin"
on public.reports
for update
using (public.is_admin())
with check (public.is_admin());

-- AUDIT LOGS
create policy "audit_logs_select_admin"
on public.audit_logs
for select
using (public.is_admin());

create policy "audit_logs_insert_admin"
on public.audit_logs
for insert
with check (public.is_admin());
