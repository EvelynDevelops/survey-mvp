// frontend/components/survey-builder/BuilderTopBar.tsx

"use client";

import * as React from "react";
import type { QuestionType } from "@/lib/survey-builder/types";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type QuestionTypeItem = {
  type: QuestionType;
  label: string;
  description?: string;
};

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

  questionTypes?: QuestionTypeItem[];
};

const DEFAULT_TYPES: QuestionTypeItem[] = [
  { type: "single", label: "Single choice", description: "One option only" },
  { type: "multiple", label: "Multiple choice", description: "Select many" },
  { type: "text", label: "Text", description: "Open-ended response" },
  { type: "image", label: "Image upload", description: "Upload an image" },
];

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
  questionTypes = DEFAULT_TYPES,
}: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);

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

          <span className="text-sm text-slate-600 whitespace-nowrap">
            {questionCount}/{maxQuestions}
          </span>

          {statusLabel ? (
            <span className="text-xs text-slate-500 whitespace-nowrap">{statusLabel}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Add question dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={!canAddQuestion}
              className="rounded-md bg-slate-900 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add question
            </button>

            {menuOpen ? (
              <>
                {/* click-away */}
                <button
                  aria-label="Close menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-20 w-72 rounded-xl border bg-white shadow-lg overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500">
                    Question type
                  </div>

                  <div className="p-2">
                    {questionTypes.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50"
                        onClick={() => {
                          onAddQuestion(item.type);
                          setMenuOpen(false);
                        }}
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </div>
                        {item.description ? (
                          <div className="text-xs text-slate-600 mt-0.5">
                            {item.description}
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {!canAddQuestion ? (
                    <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border-t">
                      You’ve reached the {maxQuestions}-question limit.
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {/* Optional actions */}
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

      {/* Row 2: error banner (optional) */}
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
