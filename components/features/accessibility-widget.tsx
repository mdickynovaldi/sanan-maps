"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/components/providers/accessibility-provider";

export function AccessibilityWidget() {
  const { prefs, toggle } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const options = [
    { key: "highContrast" as const, label: "Kontras Tinggi", icon: "contrast", desc: "Tingkatkan kontras warna" },
    { key: "largeText" as const, label: "Teks Besar", icon: "text_increase", desc: "Perbesar ukuran teks" },
    { key: "reducedMotion" as const, label: "Kurangi Animasi", icon: "animation", desc: "Matikan animasi dan transisi" },
    { key: "defaultListView" as const, label: "Mode Daftar", icon: "list", desc: "Buka daftar outlet sebagai default" },
  ];

  // Keyboard shortcut: Alt+A
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Close on Escape
      if (e.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus trap when panel is open
  useEffect(() => {
    if (!open || !panelRef.current) return;

    const panel = panelRef.current;
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>(selector));
    const focusable = getFocusable();
    const first = focusable[0];
    first?.focus();

    function handleTrap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const currentFirst = items[0];
      const currentLast = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === currentFirst) {
          e.preventDefault();
          currentLast.focus();
        }
      } else {
        if (document.activeElement === currentLast) {
          e.preventDefault();
          currentFirst.focus();
        }
      }
    }

    panel.addEventListener('keydown', handleTrap);
    return () => panel.removeEventListener('keydown', handleTrap);
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <Button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="h-14 w-14 rounded-full bg-primary-container text-on-primary-container shadow-lg hover:shadow-xl transition-shadow"
        size="icon"
        aria-label="Buka pengaturan aksesibilitas"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[28px]">accessibility_new</span>
      </Button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-16 right-0 w-80 rounded-xl border border-outline-variant bg-surface p-6 shadow-[var(--shadow-level-2)]"
          role="dialog"
          aria-modal="true"
          aria-label="Pengaturan Aksesibilitas"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-h3 text-on-surface">Aksesibilitas</h3>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Tutup panel aksesibilitas">
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>

          <div className="space-y-3">
            {options.map((opt) => {
              const enabled = prefs[opt.key];
              return (
                <button
                  key={opt.key}
                  onClick={() => toggle(opt.key)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    enabled
                      ? "border-primary-container bg-primary-container/10"
                      : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                  }`}
                  aria-pressed={enabled}
                  aria-label={`${opt.label}: ${enabled ? "aktif" : "nonaktif"}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${enabled ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-body-md font-medium text-on-surface">{opt.label}</p>
                    <p className="text-body-sm text-on-surface-variant">{opt.desc}</p>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-colors ${enabled ? "bg-primary-container" : "bg-surface-variant"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${enabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-body-sm text-on-surface-variant">
            Shortcut: <kbd className="rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] font-mono">Alt+A</kbd> buka panel ini
          </p>
        </div>
      )}
    </div>
  );
}
