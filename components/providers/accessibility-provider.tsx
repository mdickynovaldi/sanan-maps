"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AccessibilityPreferences = {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  defaultListView: boolean;
  audioGuide: boolean;
  textDirections: boolean;
};

const defaultPrefs: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  defaultListView: false,
  audioGuide: false,
  textDirections: false,
};

type AccessibilityContextValue = {
  prefs: AccessibilityPreferences;
  toggle: (key: keyof AccessibilityPreferences) => void;
  set: (key: keyof AccessibilityPreferences, value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

const STORAGE_KEY = "sanan-a11y-prefs";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(defaultPrefs);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }

    // Also respect system prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrefs((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Apply classes to <html> whenever prefs change
  useEffect(() => {
    const html = document.documentElement;

    html.classList.toggle("a11y-high-contrast", prefs.highContrast);
    html.classList.toggle("a11y-large-text", prefs.largeText);
    html.classList.toggle("a11y-reduced-motion", prefs.reducedMotion);

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const toggle = useCallback((key: keyof AccessibilityPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const set = useCallback((key: keyof AccessibilityPreferences, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <AccessibilityContext.Provider value={{ prefs, toggle, set }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
