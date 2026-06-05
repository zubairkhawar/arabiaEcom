"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${widths[size]} bg-white rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh]`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <footer className="px-5 py-4 border-t border-[var(--border)] flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
