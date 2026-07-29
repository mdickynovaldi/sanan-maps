"use client";

import { useRef, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TempeOrnament, TempePattern } from "@/components/decor/tempe-ornaments";
import { resetPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      setFieldError("Email wajib diisi");
      emailRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Format email tidak valid");
      emailRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await resetPassword(formData);

    if (!result.success) {
      setError(result.error ?? "Gagal mengirim email reset password");
      setLoading(false);
      return;
    }

    setSuccess("Link reset password telah dikirim ke email Anda.");
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4.5rem)] bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-[1280px] grid-cols-1 lg:grid-cols-2">
          <div className="relative overflow-hidden hidden lg:flex flex-col justify-between bg-surface-variant p-12 text-on-surface">
            <TempePattern patternId="tempe-forgot-panel" size={200} className="text-primary opacity-[0.04]" />
            <TempeOrnament motif="wrap" rotate={-10} strokeWidth={1.5} className="-right-14 top-1/3 h-64 w-64 text-primary opacity-[0.08]" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>explore</span>
                <span className="font-heading text-h3">Sanan Explorer</span>
              </div>
            </div>
            <div className="relative">
              <h1 className="font-heading text-h1 mb-4">Reset your password.</h1>
              <p className="text-body-lg text-on-surface-variant">
                Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden flex items-center justify-center p-6 sm:p-12">
            <TempeOrnament motif="soybean" rotate={14} className="-bottom-8 -right-8 h-32 w-32 text-primary opacity-[0.05]" />
            <div className="relative w-full max-w-[400px] flex flex-col gap-8">
              <div className="text-center lg:text-left">
                <h2 className="font-heading text-h2 text-on-surface">Forgot password?</h2>
                <p className="mt-2 text-body-md text-on-surface-variant">No worries, we&apos;ll send you reset instructions.</p>
              </div>

              {error && (
                <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-tertiary/10 p-3 text-body-sm text-tertiary" role="status" aria-live="polite">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-label-caps text-on-surface uppercase">Email Address</label>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? "forgot-email-error" : undefined}
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                  {fieldError && <p id="forgot-email-error" className="text-body-sm text-error" role="alert">{fieldError}</p>}
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container">
                  {loading ? "Sending..." : "Reset Password"}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-body-sm text-primary hover:underline">
                  &larr; Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
