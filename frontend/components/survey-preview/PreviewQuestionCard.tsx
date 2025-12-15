"use client";

import type { Question } from "@/lib/survey-builder/types";
import { PreviewInput } from "./PreviewInput";

type Props = {
  question: Question;
  index: number;
};

export function PreviewQuestionCard({ question, index }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">Question {index + 1}</div>
          <div className="mt-1 text-base font-semibold text-navy">
            {question.title || "Untitled question"}{" "}
            {question.required ? <span className="text-red-500">*</span> : null}
          </div>
          {question.description?.trim() ? (
            <div className="mt-1 text-sm text-slate-600">{question.description}</div>
          ) : null}
        </div>

        <span className="text-xs rounded-full bg-lavender px-3 py-1 text-navy border border-slate-200 whitespace-nowrap">
          {labelForType(question.type)}
        </span>
      </div>

      <div className="mt-4">
        <PreviewInput question={question} />
      </div>
    </div>
  );
}

function labelForType(type: Question["type"]) {
  switch (type) {
    case "single":
      return "Single choice";
    case "multiple":
      return "Multiple choice";
    case "text":
      return "Text";
    case "image":
      return "Image upload";
    default:
      return type;
  }
}
