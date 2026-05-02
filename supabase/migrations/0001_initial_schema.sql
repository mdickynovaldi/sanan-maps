-- Sanan UMKM Maps initial schema

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('user', 'owner', 'admin');
create type public.outlet_status as enum ('pending', 'approved', 'rejected', 'archived');
create type public.review_status as enum ('pending', 'approved', 'hidden', 'deleted');
create type public.report_type as enum ('wrong_location', 'wrong_hours', 'abusive_review', 'accessibility_issue', 'other');
create type public.report_status as enum ('open', 'in_review', 'resolved', 'rejected');
create type public.photo_type as enum ('outlet', 'product', 'menu', 'panorama');

-- Timestamp trigger helper
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'user',
  avatar_url text,
  accessibility_preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- Outlets
create table public.outlets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  landmark_description text not null,
  accessibility_description text not null,
  whatsapp text,
  opening_hours jsonb not null default '{}'::jsonb,
  status public.outlet_status not null default 'pending',
  is_accessibility_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Outlet categories
create table public.outlet_categories (
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (outlet_id, category_id)
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  category text,
  image_url text,
  image_alt text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  accessibility_rating integer check (accessibility_rating is null or (accessibility_rating >= 1 and accessibility_rating <= 5)),
  comment text not null,
  tags text[] default '{}',
  status public.review_status not null default 'pending',
  owner_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  alt_text text not null,
  type public.photo_type not null,
  created_at timestamptz not null default now()
);

-- Panoramas
create table public.panoramas (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  title text not null,
  image_360_url text not null,
  text_description text not null,
  audio_description_url text,
  latitude numeric,
  longitude numeric,
  heading numeric,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, outlet_id)
);

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  type public.report_type not null,
  description text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Audit logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_outlets_status on public.outlets(status);
create index idx_outlets_owner_id on public.outlets(owner_id);
create index idx_products_outlet_id on public.products(outlet_id);
create index idx_reviews_outlet_id on public.reviews(outlet_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_reports_outlet_id on public.reports(outlet_id);

-- Triggers for updated_at
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

create trigger outlets_updated_at before update on public.outlets
for each row execute function public.handle_updated_at();

create trigger products_updated_at before update on public.products
for each row execute function public.handle_updated_at();

create trigger reviews_updated_at before update on public.reviews
for each row execute function public.handle_updated_at();

create trigger reports_updated_at before update on public.reports
for each row execute function public.handle_updated_at();

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
