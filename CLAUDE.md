# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Local Development (Supabase lokal)

Proyek Supabase cloud lama (`xifepsqtlxkysxekuxyq`) sudah dihapus. Development
sekarang memakai Supabase lokal via Docker (kredensial cloud lama tersimpan di
`.env.local.cloud-backup`):

1. `colima start` (atau pastikan Docker daemon berjalan)
2. `npx supabase start` — port digeser ke 54331 (API), 54332 (DB), 54333 (Studio),
   54334 (Mailpit) agar tidak bentrok dengan proyek Supabase lokal lain
3. `npx tsx --env-file=.env.local scripts/seed-local.ts` — seed kategori, 15 outlet
   dengan koordinat asli Kampung Sanan, review, produk, panorama demo, dan akun demo
4. `npm run dev`

Akun demo: `admin@sanan.local`/`admin123456`, `owner@sanan.local`/`owner123456`,
`budi@sanan.local`/`budi123456`, `siti@sanan.local`/`siti123456`.

Koordinat referensi Kampung Sanan ada di `lib/geo.ts` (`SANAN_CENTER`,
bbox Jalan Sanan dari OSM). Panorama 360 dirender dengan pannellum
(`components/features/equirect-viewer.tsx`); rute jalan kaki memakai
OSRM demo server (`lib/geo.ts:fetchWalkingRoute`).

## Tech Stack

- **Framework**: Next.js 16.x App Router
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.x with shadcn/ui
- **Database/Backend**: Supabase (Postgres, Auth, Storage, RLS)
- **Map**: mapcn (MapLibre GL)
- **Forms**: React Hook Form + Zod

## Important Context

This is NOT the Next.js you know. Next.js 16.x has breaking changes. Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Purpose

Sanan UMKM Maps is a mapping platform for SMEs in the Sanan area (Kampung Sanan, Malang). Key features include:

- Interactive map with outlet markers
- Accessible outlet list (text-based alternative to map)
- Outlet details with products, reviews, and 360° views
- Role-based access (user, owner, admin)
- Accessibility-first design (WCAG 2.2 Level AA)

## Architecture

### Data Models (Supabase)

- `profiles` - User profiles with roles (user/owner/admin)
- `outlets` - SME outlet data with coordinates, status (pending/approved/rejected)
- `products` - Products/menu items per outlet
- `reviews` - User reviews with ratings
- `photos` - Outlet/product photos with required alt_text
- `panoramas` - 360° view content
- `favorites` - User saved outlets
- `reports` - User-submitted data error reports
- `audit_logs` - Admin action tracking

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Public read-only for approved outlets/products/reviews
- Only authenticated users can create reviews/favorites/reports

## Accessibility Requirements

Every feature must have a text-based alternative. The map is not the only UI:

- All images require alt_text
- All outlets require landmark_description and accessibility_description
- Markers must have accessible labels
- Forms must have explicit labels and error messages
- All interactive elements must be keyboard-navigable

## Folder Structure

```
app/           - Next.js App Router pages
components/    - React components
  ui/          - shadcn/ui components
lib/           - Utilities and Supabase client
supabase/      - Supabase configuration (linked project)
```
