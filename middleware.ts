import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware HANYA menyentuh sesi untuk rute /dashboard.
 *
 * Sebelumnya getUser() (yang bisa merotasi refresh token) berjalan di SEMUA
 * request — termasuk prefetch Next.js untuk link halaman publik. Rotasi token
 * di prefetch balapan dengan refresh milik Supabase client di browser, memicu
 * deteksi "refresh token reuse" yang MEMATIKAN sesi — gejalanya: klik link
 * dari dashboard ke halaman publik (logo, "Jelajahi Outlet") tampak
 * "auto logout". Halaman publik tidak butuh sesi di middleware (query jalan
 * dari browser client yang me-refresh tokennya sendiri).
 */
export async function middleware(request: NextRequest) {
  // Jangan refresh token pada prefetch — hanya navigasi sungguhan.
  if (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch"
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Auth guard: redirect non-authenticated users from /dashboard/*
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
