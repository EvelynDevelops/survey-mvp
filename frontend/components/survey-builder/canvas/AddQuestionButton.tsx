// frontend/components/survey-builder/canvas/AddQuestionButton.tsx

"use client";

import type { QuestionType } from "@/lib/survey-builder/types";

type Props = {
  onAdd: (type: QuestionType) => void;
  disabled?: boolean;
};

export function AddQuestionButton({ onAdd, disabled }: Props) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAdd("single")}
        className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        + Single
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAdd("text")}
        className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        + Text
      </button>
    </div>
  );
}
