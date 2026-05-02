"use client";

import { useState } from "react";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";

const preferences = [
  { key: "highContrast", label: "High Contrast", desc: "Tingkatkan keterbacaan visual", defaultValue: false },
  { key: "largeText", label: "Large Text", desc: "Perbesar ukuran teks", defaultValue: true },
  { key: "reducedMotion", label: "Reduced Motion", desc: "Kurangi animasi dan transisi", defaultValue: false },
  { key: "defaultListView", label: "Default List View", desc: "Buka daftar outlet sebagai tampilan utama", defaultValue: false },
  { key: "audioGuide", label: "Audio Guide", desc: "Aktifkan panduan suara", defaultValue: true },
  { key: "textDirections", label: "Text Directions", desc: "Gunakan instruksi arah berbasis teks", defaultValue: true },
];

export default function UserSettingsPage() {
  const [settings, setSettings] = useState(
    Object.fromEntries(preferences.map((p) => [p.key, p.defaultValue]))
  );

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Accessibility Preferences</h2>
          <p className="text-body-sm text-on-surface-variant">Atur preferensi pengalaman aksesibilitas Anda</p>
        </header>

        <div className="space-y-4 max-w-[800px]">
          {preferences.map((pref) => {
            const enabled = Boolean(settings[pref.key]);
            return (
              <label key={pref.key} className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-6 cursor-pointer hover:bg-surface-container-lowest transition-colors">
                <div>
                  <h3 className="font-heading text-body-lg text-on-surface">{pref.label}</h3>
                  <p className="text-body-sm text-on-surface-variant">{pref.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, [pref.key]: !enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary-container" : "bg-surface-variant"}`}
                  aria-pressed={enabled}
                  aria-label={`Toggle ${pref.label}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            );
          })}
        </div>
      </main>
    </div>
  );
}