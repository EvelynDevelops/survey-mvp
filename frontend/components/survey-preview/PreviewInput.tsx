"use client";

import type { Question } from "@/lib/survey-builder/types";

type Props = {
  question: Question;
};

export function PreviewInput({ question }: Props) {
  switch (question.type) {
    case "single":
      return (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" disabled className="h-4 w-4" />
              <span>{opt.label || "Option"}</span>
            </label>
          ))}
        </div>
      );

    case "multiple":
      return (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" disabled className="h-4 w-4" />
              <span>{opt.label || "Option"}</span>
            </label>
          ))}
        </div>
      );

    case "text":
      return (
        <textarea
          disabled
          rows={3}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-slate-50"
          placeholder={question.placeholder?.trim() ? question.placeholder : "Type your answer…"}
        />
      );

    case "image":
      return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <div className="text-sm font-semibold text-slate-700">Upload image</div>
          <div className="mt-1 text-xs text-slate-500">
            Accept: {question.upload.accept.join(", ")} · Max size:{" "}
            {Math.round(question.upload.maxSizeBytes / (1024 * 1024))}MB · Max files:{" "}
            {question.upload.maxFiles}
          </div>
        </div>
      );

    default:
      return null;
  }
}
