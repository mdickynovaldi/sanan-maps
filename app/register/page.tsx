"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/actions/auth";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const [role, setRole] = useState<"user" | "owner">("user");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const refs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    name: nameRef,
    email: emailRef,
    password: passwordRef,
    confirmPassword: confirmRef,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const errs: FieldErrors = {};
    if (!name || name.length < 2) errs.name = "Nama minimal 2 karakter";
    if (!email) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Format email tidak valid";
    if (!password) errs.password = "Password wajib diisi";
    else if (password.length < 6) errs.password = "Password minimal 6 karakter";
    if (!confirmPassword) errs.confirmPassword = "Konfirmasi password wajib diisi";
    else if (password !== confirmPassword) errs.confirmPassword = "Password tidak cocok";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstKey = Object.keys(errs)[0] as keyof FieldErrors;
      refs[firstKey]?.current?.focus();
      return;
    }

    setLoading(true);
    const result = await signUp(formData);

    if (result && !result.success) {
      setError(result.error ?? "Pendaftaran gagal");
      setLoading(false);
    }
  }

  function fieldProps(name: keyof FieldErrors) {
    const errId = fieldErrors[name] ? `register-${name}-error` : undefined;
    return {
      "aria-invalid": Boolean(fieldErrors[name]),
      "aria-describedby": errId,
    };
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4.5rem)] bg-background">
        <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-[1280px] grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between bg-surface-variant p-12 text-surface-container-lowest">
            <div>
              <div className="mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>explore</span>
                <span className="font-heading text-h3">Sanan Explorer</span>
              </div>
            </div>
            <div>
              <h1 className="font-heading text-h1 mb-4">Join the community.</h1>
              <p className="text-body-lg text-surface-container-low">
                Daftarkan akun untuk menyimpan favorit, menulis ulasan, dan mendukung UMKM lokal Sanan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-[400px] flex flex-col gap-8">
              <div className="text-center lg:text-left">
                <h2 className="font-heading text-h2 text-on-surface">Create an account</h2>
                <p className="mt-2 text-body-md text-on-surface-variant">Enter your details below to join the community.</p>
              </div>

              <div className="flex p-1 bg-surface-container rounded-lg">
                <Button asChild variant="ghost" className="flex-1 text-on-surface-variant" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="flex-1 bg-surface-container-lowest shadow-sm text-on-surface" size="sm">Register</Button>
              </div>

              {error && (
                <div id="register-form-error" className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Role selection */}
                <fieldset>
                  <legend className="text-label-caps text-on-surface uppercase mb-2">Tipe Akun</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex flex-col items-start p-4 cursor-pointer rounded-xl border-2 transition-colors ${role === "user" ? "border-primary-container bg-surface-container-lowest shadow-[var(--shadow-level-1)]" : "border-outline-variant bg-surface hover:bg-surface-container-low"}`}>
                      <input
                        checked={role === "user"}
                        onChange={() => setRole("user")}
                        className="peer sr-only"
                        name="role-radio"
                        type="radio"
                        value="user"
                      />
                      <span className="material-symbols-outlined text-primary mb-2">person</span>
                      <span className="text-body-sm font-medium text-on-surface">Visitor / Tourist</span>
                    </label>
                    <label className={`relative flex flex-col items-start p-4 cursor-pointer rounded-xl border-2 transition-colors ${role === "owner" ? "border-primary-container bg-surface-container-lowest shadow-[var(--shadow-level-1)]" : "border-outline-variant bg-surface hover:bg-surface-container-low"}`}>
                      <input
                        checked={role === "owner"}
                        onChange={() => setRole("owner")}
                        className="peer sr-only"
                        name="role-radio"
                        type="radio"
                        value="owner"
                      />
                      <span className="material-symbols-outlined text-on-surface-variant mb-2">storefront</span>
                      <span className="text-body-sm font-medium text-on-surface-variant">UMKM Owner</span>
                    </label>
                  </div>
                </fieldset>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-label-caps text-on-surface uppercase">Full Name</label>
                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nama lengkap"
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    {...fieldProps("name")}
                  />
                  {fieldErrors.name && <p id="register-name-error" className="text-body-sm text-error" role="alert">{fieldErrors.name}</p>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-label-caps text-on-surface uppercase">Email Address</label>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    {...fieldProps("email")}
                  />
                  {fieldErrors.email && <p id="register-email-error" className="text-body-sm text-error" role="alert">{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-label-caps text-on-surface uppercase">Password</label>
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    {...fieldProps("password")}
                  />
                  {fieldErrors.password && <p id="register-password-error" className="text-body-sm text-error" role="alert">{fieldErrors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-label-caps text-on-surface uppercase">Confirm Password</label>
                  <input
                    ref={confirmRef}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    {...fieldProps("confirmPassword")}
                  />
                  {fieldErrors.confirmPassword && <p id="register-confirmPassword-error" className="text-body-sm text-error" role="alert">{fieldErrors.confirmPassword}</p>}
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container">
                  {loading ? "Creating account..." : "Create Account"}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
