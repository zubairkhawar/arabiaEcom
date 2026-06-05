"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

const fieldBase =
  "w-full rounded-lg border border-[var(--border)] bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";

export function Input({ label, hint, leftIcon, className, ...rest }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <span className="relative block">
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          className={cn(fieldBase, "h-10 px-3", leftIcon && "pl-9", className)}
          {...rest}
        />
      </span>
      {hint && (
        <span className="block mt-1 text-xs text-[var(--text-muted)]">{hint}</span>
      )}
    </label>
  );
}

export function Textarea({
  label,
  hint,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className="block">
      {label && (
        <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <textarea className={cn(fieldBase, "px-3 py-2 min-h-[88px]", className)} {...rest} />
      {hint && (
        <span className="block mt-1 text-xs text-[var(--text-muted)]">{hint}</span>
      )}
    </label>
  );
}

export function Select({
  label,
  hint,
  options,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      {label && (
        <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <select className={cn(fieldBase, "h-10 px-3 pr-8", className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="block mt-1 text-xs text-[var(--text-muted)]">{hint}</span>
      )}
    </label>
  );
}
