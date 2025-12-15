// frontend/components/survey-builder/canvas/questions/MultipleChoiceQuestionView.tsx

"use client";

import * as React from "react";
import type { MultipleChoiceQuestion } from "@/lib/survey-builder/types";

type Props = {
  question: MultipleChoiceQuestion;
};

export function MultipleChoiceQuestionView({ question }: Props) {
  const options = question.options ?? [];

  return (
    <div className="mt-3 space-y-2">
      {options.length === 0 ? (
        <EmptyHint text="Add options in the right panel." />
      ) : (
        options.slice(0, 4).map((opt) => (
          <div
            key={opt.id}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <span className="h-4 w-4 rounded border border-slate-300 bg-white" />
            <span className="truncate">{opt.label || "Untitled option"}</span>
          </div>
        ))
      )}

      {options.length > 4 ? (
        <div className="text-xs text-slate-500">+ {options.length - 4} more</div>
      ) : null}

      {question.constraints?.maxSelected ? (
        <div className="text-xs text-slate-500">
          Max {question.constraints.maxSelected} selections
        </div>
      ) : null}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-sm text-slate-600 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
      {text}
    </div>
  );
}
