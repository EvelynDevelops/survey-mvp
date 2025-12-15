// frontend/components/survey-builder/canvas/questions/TextQuestionView.tsx

"use client";

import * as React from "react";
import type { TextQuestion } from "@/lib/survey-builder/types";

type Props = {
  question: TextQuestion;
};

export function TextQuestionView({ question }: Props) {
  return (
    <div className="mt-3">
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
        {question.placeholder?.trim() ? question.placeholder : "Type your answer…"}
      </div>

      {question.constraints?.maxLength ? (
        <div className="mt-2 text-xs text-slate-500">
          Max {question.constraints.maxLength} characters
        </div>
      ) : null}
    </div>
  );
}
