// frontend/components/survey-builder/side-panel/SidePanel.tsx

"use client";

import * as React from "react";
import type { Question } from "@/lib/survey-builder/types";
import { QuestionSettingsForm } from "./QuestionSettingsForm";

type Props = {
  selectedQuestion: Question | null;

  onUpdateSelected: (patch: Partial<Question>) => void;

  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
};

export function SidePanel({
  selectedQuestion,
  onUpdateSelected,
  onDeleteSelected,
  onDuplicateSelected,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">Settings</div>
        <div className="text-xs text-slate-600">Edit the selected question.</div>
      </div>

      <div className="p-4">
        {selectedQuestion ? (
          <QuestionSettingsForm
            question={selectedQuestion}
            onChange={onUpdateSelected}
            onDelete={onDeleteSelected}
            onDuplicate={onDuplicateSelected}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed p-6 text-slate-600">
      <div className="font-semibold text-slate-900">No question selected</div>
      <div className="mt-1 text-sm">Select a question from the list to edit it.</div>
    </div>
  );
}
