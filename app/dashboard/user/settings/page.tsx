"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import {
  useAccessibility,
  type AccessibilityPreferences,
} from "@/components/providers/accessibility-provider";
import { getProfile, updateAccessibilityPreferences } from "@/lib/actions/profiles";

const preferences: Array<{
  key: keyof AccessibilityPreferences;
  label: string;
  desc: string;
}> = [
  { key: "highContrast", label: "High Contrast", desc: "Tingkatkan keterbacaan visual" },
  { key: "largeText", label: "Large Text", desc: "Perbesar ukuran teks" },
  { key: "reducedMotion", label: "Reduced Motion", desc: "Kurangi animasi dan transisi" },
  { key: "defaultListView", label: "Default List View", desc: "Buka daftar outlet sebagai tampilan utama" },
  { key: "audioGuide", label: "Audio Guide", desc: "Aktifkan panduan suara" },
  { key: "textDirections", label: "Text Directions", desc: "Gunakan instruksi arah berbasis teks" },
];

export default function UserSettingsPage() {
  const { prefs, set } = useAccessibility();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Nilai terkini di luar siklus render — mencegah dua klik beruntun
  // saling menimpa payload yang dikirim ke server.
  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  // Penanda user sudah berinteraksi — respons getProfile yang datang terlambat
  // tidak boleh menimpa toggle yang baru saja diklik.
  const interactedRef = useRef(false);

  // Muat preferensi tersimpan dari profil sekali saat halaman dibuka, lalu
  // terapkan ke provider supaya tampilan situs langsung mengikuti.
  useEffect(() => {
    let cancelled = false;
    getProfile().then(({ data }) => {
      if (cancelled || !data || interactedRef.current) return;
      const dbPrefs =
        (data as { accessibility_preferences?: Partial<AccessibilityPreferences> | null })
          .accessibility_preferences ?? {};
      const osReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      (Object.entries(dbPrefs) as Array<[keyof AccessibilityPreferences, unknown]>).forEach(
        ([key, value]) => {
          if (typeof value !== "boolean" || !preferences.some((p) => p.key === key)) return;
          // Jangan matikan reduced motion yang dinyalakan setelan OS
          if (key === "reducedMotion" && value === false && osReducedMotion) return;
          set(key, value);
        },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [set]);

  async function handleToggle(key: keyof AccessibilityPreferences) {
    interactedRef.current = true;
    const previous = prefsRef.current[key];
    const next = { ...prefsRef.current, [key]: !previous };
    prefsRef.current = next;

    // Efek visual instan + tersimpan di localStorage lewat provider
    set(key, !previous);
    setSaveError(null);

    // Persist ke profil Supabase agar Quick Preferences di dashboard ikut terisi
    const result = await updateAccessibilityPreferences(next);
    if (result.success) {
      setSavedAt(Date.now());
    } else {
      prefsRef.current = { ...prefsRef.current, [key]: previous };
      set(key, previous);
      setSaveError(result.error ?? "Gagal menyimpan preferensi. Silakan coba lagi.");
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Accessibility Preferences</h2>
          <p className="text-body-sm text-on-surface-variant">Atur preferensi pengalaman aksesibilitas Anda</p>
        </header>

        <div aria-live="polite" className="mb-4 max-w-[800px]">
          {saveError ? (
            <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
              {saveError}
            </div>
          ) : savedAt ? (
            /* key memaksa remount tiap simpan agar aria-live mengumumkannya lagi */
            <p key={savedAt} className="text-body-sm text-on-surface-variant">Preferensi tersimpan.</p>
          ) : null}
        </div>

        <div className="space-y-4 max-w-[800px]">
          {preferences.map((pref) => {
            const enabled = Boolean(prefs[pref.key]);
            return (
              <div
                key={pref.key}
                className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-6 hover:bg-surface-container-lowest transition-colors"
              >
                <div>
                  <h3 className="font-heading text-body-lg text-on-surface">{pref.label}</h3>
                  <p className="text-body-sm text-on-surface-variant">{pref.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(pref.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary-container" : "bg-surface-variant"}`}
                  aria-pressed={enabled}
                  aria-label={`Toggle ${pref.label}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
