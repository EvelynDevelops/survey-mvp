// frontend/components/survey-builder/canvas/QuestionTypeMenu.tsx

"use client";

import * as React from "react";
import type { QuestionType } from "@/lib/survey-builder/types";

type Props = {
  onSelect: (type: QuestionType) => void;
  disabled?: boolean;
};

const TYPES: { type: QuestionType; label: string }[] = [
  { type: "single", label: "Single choice" },
  { type: "multiple", label: "Multiple choice" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image upload" },
];

export function QuestionTypeMenu({ onSelect, disabled }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        Add question
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-48 rounded-md border bg-white shadow">
          {TYPES.map((t) => (
            <button
              key={t.type}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => {
                onSelect(t.type);
                setOpen(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
