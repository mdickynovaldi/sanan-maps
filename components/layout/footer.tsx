import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "bg-slate-900 dark:bg-black text-amber-500 font-heading text-xs uppercase tracking-widest font-bold",
        "w-full py-8 md:py-12 border-t border-slate-800",
        "flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-6",
        className
      )}
    >
      <div className="text-amber-500 opacity-80 hover:opacity-100 transition-opacity text-center md:text-left">
        © 2026 Sanan Artisan Village. Empowering Local MSMEs.
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <a
          href="/accessibility"
          className="text-slate-400 hover:text-amber-400 transition-colors opacity-80 hover:opacity-100"
        >
          Accessibility Statement
        </a>
        <a href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors opacity-80 hover:opacity-100">
          Privacy Policy
        </a>
        <a href="/about" className="text-slate-400 hover:text-amber-400 transition-colors opacity-80 hover:opacity-100">
          Tourism Office
        </a>
        <a href="/contact" className="text-slate-400 hover:text-amber-400 transition-colors opacity-80 hover:opacity-100">
          Contact Us
        </a>
      </nav>
    </footer>
  );
}
