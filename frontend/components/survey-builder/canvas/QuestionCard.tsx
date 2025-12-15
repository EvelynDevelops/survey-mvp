"use client";

import * as React from "react";
import type { Question, QuestionId } from "@/lib/survey-builder/types";
import { QuestionRenderer } from "./QuestionRenderer";

type Props = {
  question: Question;
  index: number;
  isSelected: boolean;

  onSelect: (id: QuestionId) => void;
  onUpdate: (id: QuestionId, patch: Partial<Question>) => void;

  onDelete: (id: QuestionId) => void;
  onDuplicate: (id: QuestionId) => void;

  onMoveUp: (id: QuestionId) => void;
  onMoveDown: (id: QuestionId) => void;

  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
};

export function QuestionCard({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(question.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(question.id);
        }
      }}
      className={[
        "rounded-xl border p-4 transition cursor-pointer",
        isSelected
          ? "border-slate-900 bg-slate-50"
          : "border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">
            Q{index + 1} · {labelForType(question.type)}
          </div>

          <div className="mt-1 font-semibold text-slate-900 truncate">
            {question.title || "Untitled question"}
          </div>

          {question.description ? (
            <div className="mt-1 text-sm text-slate-600 line-clamp-2">
              {question.description}
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Required */}
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span>Required</span>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={question.required}
              onChange={(e) =>
                onUpdate(question.id, { required: e.target.checked })
              }
            />
          </label>

          <IconButton
            title="Move up"
            disabled={disableMoveUp}
            onClick={() => onMoveUp(question.id)}
          >
            ↑
          </IconButton>

          <IconButton
            title="Move down"
            disabled={disableMoveDown}
            onClick={() => onMoveDown(question.id)}
          >
            ↓
          </IconButton>

          <IconButton
            title="Duplicate"
            onClick={() => onDuplicate(question.id)}
          >
            ⎘
          </IconButton>

          <IconButton
            title="Delete"
            onClick={() => onDelete(question.id)}
          >
            🗑
          </IconButton>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-3">
        <QuestionRenderer question={question} />
      </div>
    </div>
  );
}

function IconButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="text-sm">{children}</span>
    </button>
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
