"use client";

import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OptionIn } from "@/lib/types";

export function OptionsEditor({
  options,
  onChange,
}: {
  options: OptionIn[];
  onChange: (next: OptionIn[]) => void;
}) {
  const setOption = (idx: number, patch: Partial<OptionIn>) => {
    onChange(options.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const addOption = () => {
    onChange([...options, { name: "", values: [] }]);
  };

  const addValue = (idx: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const existing = options[idx].values;
    if (existing.includes(trimmed)) return;
    setOption(idx, { values: [...existing, trimmed] });
  };

  const removeValue = (idx: number, value: string) => {
    setOption(idx, { values: options[idx].values.filter((v) => v !== value) });
  };

  if (options.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Add options like Size or Color. Variants are auto-generated from every combination.
        </p>
        <Button leftIcon={<Plus size={16} />} variant="outline" onClick={addOption}>
          Add option
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((opt, idx) => (
        <OptionRow
          key={idx}
          option={opt}
          onNameChange={(name) => setOption(idx, { name })}
          onAddValue={(v) => addValue(idx, v)}
          onRemoveValue={(v) => removeValue(idx, v)}
          onRemove={() => removeOption(idx)}
        />
      ))}
      <Button leftIcon={<Plus size={16} />} variant="outline" onClick={addOption}>
        Add option
      </Button>
    </div>
  );
}

function OptionRow({
  option,
  onNameChange,
  onAddValue,
  onRemoveValue,
  onRemove,
}: {
  option: OptionIn;
  onNameChange: (name: string) => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    onAddValue(draft);
    setDraft("");
  };

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-slate-50/50">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Option name"
            value={option.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Size"
          />
        </div>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded mb-0.5"
          aria-label="Remove option"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="mt-3">
        <span className="block mb-1.5 text-xs font-medium text-[var(--text-secondary)]">
          Values
        </span>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {option.values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full bg-white border border-[var(--border)] text-xs"
            >
              {v}
              <button
                onClick={() => onRemoveValue(v)}
                className="text-slate-400 hover:text-red-600"
                aria-label={`Remove ${v}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            placeholder="Add a value and press Enter"
          />
          <Button variant="outline" onClick={commit} disabled={!draft.trim()}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
