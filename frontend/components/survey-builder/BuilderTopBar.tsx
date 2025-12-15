// frontend/components/survey-builder/BuilderTopBar.tsx

"use client";

import * as React from "react";
import type { QuestionType } from "@/lib/survey-builder/types";
import { QuestionCountBadge } from "@/components/survey-builder/QuestionCountBadge";
import { QuestionTypeMenu } from "@/components/survey-builder/canvas/QuestionTypeMenu";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type Props = {
  title: string;
  onTitleChange: (title: string) => void;

  questionCount: number;
  maxQuestions?: number; // default 100
  canAddQuestion: boolean;

  saveStatus?: SaveStatus;

  onAddQuestion: (type: QuestionType) => void;

  onPreview?: () => void;
  onPublish?: () => void;

  error?: string | null;
  onClearError?: () => void;
};

export function BuilderTopBar({
  title,
  onTitleChange,
  questionCount,
  maxQuestions = 100,
  canAddQuestion,
  saveStatus = "idle",
  onAddQuestion,
  onPreview,
  onPublish,
  error,
  onClearError,
}: Props) {
  React.useEffect(() => {
    if (!error) return;
    if (!onClearError) return;
    const t = setTimeout(() => onClearError(), 3000);
    return () => clearTimeout(t);
  }, [error, onClearError]);

  const statusLabel =
    saveStatus === "dirty"
      ? "Unsaved"
      : saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
      ? "Saved"
      : "";

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled survey"
            className="min-w-0 w-[280px] sm:w-[360px] md:w-[420px] bg-transparent text-lg font-semibold outline-none border border-transparent focus:border-slate-200 rounded-md px-2 py-1"
          />

          <QuestionCountBadge count={questionCount} max={maxQuestions} />

          {statusLabel ? (
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {statusLabel}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Add question dropdown (extracted component) */}
          <QuestionTypeMenu onSelect={onAddQuestion} disabled={!canAddQuestion} />

          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Preview
            </button>
          ) : null}

          {onPublish ? (
            <button
              type="button"
              onClick={onPublish}
              className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Publish
            </button>
          ) : null}
        </div>
      </div>

      {/* Row 2: error banner */}
      {error ? (
        <div className="rounded-md bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 flex items-start justify-between gap-3">
          <div className="min-w-0">{error}</div>
          {onClearError ? (
            <button
              type="button"
              className="text-red-700/70 hover:text-red-700 text-sm"
              onClick={onClearError}
            >
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
