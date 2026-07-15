"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";

export interface OpeningHoursRow {
  days: string;
  hours: string;
}

export const DEFAULT_OPENING_HOURS: Record<string, string> = { "Senin-Jumat": "08:00 - 17:00" };

/** Mengubah objek jam buka (jsonb) menjadi baris-baris form, mempertahankan urutan kunci. */
export function openingHoursToRows(openingHours?: Record<string, string> | null): OpeningHoursRow[] {
  const rows = Object.entries(openingHours ?? {}).map(([days, hours]) => ({ days, hours }));
  return rows.length > 0 ? rows : Object.entries(DEFAULT_OPENING_HOURS).map(([days, hours]) => ({ days, hours }));
}

/** Menyusun kembali objek jam buka dari baris form; baris tanpa nama hari dilewati. */
export function rowsToOpeningHours(rows: OpeningHoursRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { days, hours } of rows) {
    const key = days.trim();
    if (!key) continue;
    result[key] = hours.trim();
  }
  return Object.keys(result).length > 0 ? result : { ...DEFAULT_OPENING_HOURS };
}

interface OpeningHoursFieldProps {
  rows: OpeningHoursRow[];
  onChange: (rows: OpeningHoursRow[]) => void;
  legend?: string;
  legendClassName?: string;
  inputClassName?: string;
}

/**
 * Editor jam buka multi-baris: satu baris per rentang hari (mis. "Senin-Jumat",
 * "Sabtu", "Minggu") agar edit tidak menghapus hari di luar baris pertama.
 */
export function OpeningHoursField({
  rows,
  onChange,
  legend = "Jam Buka",
  legendClassName = "text-body-sm font-medium text-on-surface",
  inputClassName = "w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary",
}: OpeningHoursFieldProps) {
  const idPrefix = useId();

  function updateRow(index: number, patch: Partial<OpeningHoursRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { days: "", hours: "" }]);
  }

  return (
    <fieldset>
      <legend className={`${legendClassName} mb-1`}>{legend}</legend>
      <p className="text-body-sm text-on-surface-variant mb-2">
        Satu baris per rentang hari. Contoh hari: &quot;Senin-Jumat&quot; atau &quot;Minggu&quot;; contoh jam:
        &quot;08:00 - 17:00&quot; atau &quot;Tutup&quot;.
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-wrap items-start gap-2">
            <div className="min-w-[9rem] flex-1">
              <label htmlFor={`${idPrefix}-days-${i}`} className="sr-only">
                Hari baris {i + 1}
              </label>
              <input
                id={`${idPrefix}-days-${i}`}
                value={row.days}
                onChange={(e) => updateRow(i, { days: e.target.value })}
                placeholder="Senin-Jumat"
                className={inputClassName}
              />
            </div>
            <div className="min-w-[9rem] flex-1">
              <label htmlFor={`${idPrefix}-hours-${i}`} className="sr-only">
                Jam buka baris {i + 1}
              </label>
              <input
                id={`${idPrefix}-hours-${i}`}
                value={row.hours}
                onChange={(e) => updateRow(i, { hours: e.target.value })}
                placeholder="08:00 - 17:00"
                className={inputClassName}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              aria-label={`Hapus baris jam buka ${row.days.trim() || i + 1}`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="mt-2">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
        Tambah Baris Jam Buka
      </Button>
    </fieldset>
  );
}
