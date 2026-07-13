"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input password dengan tombol mata untuk menampilkan/menyembunyikan isian.
 * Styling mengikuti input di halaman login/register (token MD3).
 */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          // [&::-ms-reveal]:hidden — matikan ikon mata bawaan Edge agar tidak dobel
          "h-10 w-full px-3 py-2 pr-11 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary [&::-ms-reveal]:hidden",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label="Tampilkan password"
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
