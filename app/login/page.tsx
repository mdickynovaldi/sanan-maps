"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { signIn } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [error, setError] = useState<string | null>(null);

  // Sudah login? Jangan tampilkan form login lagi — langsung ke dashboard.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirectTo || "/dashboard");
    });
  }, [router, redirectTo]);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email) nextFieldErrors.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextFieldErrors.email = "Format email tidak valid";
    if (!password) nextFieldErrors.password = "Password wajib diisi";
    else if (password.length < 6) nextFieldErrors.password = "Password minimal 6 karakter";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.email) emailRef.current?.focus();
      else if (nextFieldErrors.password) passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await signIn(formData);

    if (result && !result.success) {
      setError(result.error ?? "Login gagal");
      setLoading(false);
    }
    // If success, signIn redirects to /dashboard/user
  }

  const errorId = error ? "login-form-error" : undefined;
  const emailErrorId = fieldErrors.email ? "login-email-error" : undefined;
  const passwordErrorId = fieldErrors.password ? "login-password-error" : undefined;

  const getDescribedBy = (...ids: (string | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4.5rem)] bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-[1280px] grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between bg-surface-variant p-12 text-surface-container-lowest">
            <div>
              <div className="mb-8 flex items-center gap-2">
                <Logo className="h-9 w-9" />
                <span className="font-heading text-h3">Sanan Explorer</span>
              </div>
            </div>
            <div>
              <h1 className="font-heading text-h1 mb-4">Discover local craftsmanship.</h1>
              <p className="text-body-lg text-surface-container-low">
                Connect directly with UMKM partners and explore the authentic flavors and crafts of Sanan Artisan Village.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-[400px] flex flex-col gap-8">
              <div className="text-center lg:text-left">
                <h2 className="font-heading text-h2 text-on-surface">Welcome back</h2>
                <p className="mt-2 text-body-md text-on-surface-variant">Masuk untuk melanjutkan eksplorasi UMKM Sanan.</p>
              </div>

              <div className="flex p-1 bg-surface-container rounded-lg">
                <Button className="flex-1 bg-surface-container-lowest shadow-sm text-on-surface" size="sm">Login</Button>
                <Button asChild variant="ghost" className="flex-1 text-on-surface-variant" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>

              {error && (
                <div id={errorId} className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-label-caps text-on-surface uppercase">Email Address</label>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={getDescribedBy(emailErrorId, errorId)}
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                  {fieldErrors.email && (
                    <p id={emailErrorId} className="text-body-sm text-error" role="alert" aria-live="polite">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-label-caps text-on-surface uppercase">Password</label>
                    <Link href="/forgot-password" className="text-body-sm text-primary hover:underline">Forgot?</Link>
                  </div>
                  <PasswordInput
                    ref={passwordRef}
                    id="password"
                    name="password"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={getDescribedBy(passwordErrorId, errorId)}
                  />
                  {fieldErrors.password && (
                    <p id={passwordErrorId} className="text-body-sm text-error" role="alert" aria-live="polite">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container">
                  {loading ? "Logging in..." : "Login"}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </form>

              <p className="text-center text-body-sm text-on-surface-variant">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:underline">Daftar sekarang</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
