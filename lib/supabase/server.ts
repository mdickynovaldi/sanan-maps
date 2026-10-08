import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

export async function createClient({ timeoutMs }: { timeoutMs?: number } = {}) {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("[supabase] Konfigurasi env belum lengkap", {
      urlConfigured: Boolean(url),
      anonKeyConfigured: Boolean(anonKey),
    });
    throw new Error("NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi.");
  }

  return createServerClient<Database>(
    url,
    anonKey,
    {
      global: timeoutMs ? {
        fetch(input, init) {
          const timeout = AbortSignal.timeout(timeoutMs);
          const signal = init?.signal
            ? AbortSignal.any([init.signal, timeout])
            : timeout;
          return fetch(input, { ...init, signal });
        },
      } : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
