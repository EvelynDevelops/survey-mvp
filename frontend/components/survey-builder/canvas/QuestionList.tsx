// frontend/components/survey-builder/canvas/QuestionList.tsx

"use client";

import * as React from "react";
import type { Question, QuestionId } from "@/lib/survey-builder/types";
import { QuestionCard } from "./QuestionCard";

type Props = {
  questions: Question[];
  selectedQuestionId: QuestionId | null;

  onSelect: (id: QuestionId) => void;
  onUpdate: (id: QuestionId, patch: Partial<Question>) => void;

  onDelete: (id: QuestionId) => void;
  onDuplicate: (id: QuestionId) => void;

  onMoveUp: (id: QuestionId) => void;
  onMoveDown: (id: QuestionId) => void;

  /** Optional: show empty state actions */
  emptyState?: React.ReactNode;
};

export function QuestionList({
  questions,
  selectedQuestionId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  emptyState,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">Questions</div>
        <div className="text-xs text-slate-600">
          Select a question to edit its settings.
        </div>
      </div>

      <div className="p-4 space-y-3">
        {questions.length === 0 ? (
          emptyState ?? (
            <div className="rounded-xl border border-dashed p-6 text-center text-slate-600">
              <div className="font-semibold text-slate-900">
                Start by adding your first question
              </div>
              <div className="mt-1 text-sm">
                Use <span className="font-medium">Add question</span> in the top bar.
              </div>
            </div>
          )
        ) : (
          questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              isSelected={q.id === selectedQuestionId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              disableMoveUp={idx === 0}
              disableMoveDown={idx === questions.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
