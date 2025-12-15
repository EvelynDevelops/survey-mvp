// frontend/components/survey-builder/canvas/questions/ImageUploadQuestionView.tsx

"use client";

import * as React from "react";
import type { ImageUploadQuestion } from "@/lib/survey-builder/types";

type Props = {
  question: ImageUploadQuestion;
};

export function ImageUploadQuestionView({ question }: Props) {
  const accept =
    question.upload.accept?.length ? question.upload.accept.join(", ") : "image/*";

  const maxMB = Math.max(1, Math.round(question.upload.maxSizeBytes / (1024 * 1024)));
  const maxFiles = question.upload.maxFiles ?? 1;

  return (
    <div className="mt-3 space-y-2">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <div className="text-sm font-semibold text-slate-700">Upload image</div>
        <div className="mt-1 text-xs text-slate-500">
          Drag & drop, or click to browse
        </div>
      </div>

      <div className="text-xs text-slate-600">
        <div>
          <span className="font-semibold">Accept:</span> {accept}
        </div>
        <div>
          <span className="font-semibold">Max size:</span> {maxMB}MB
        </div>
        <div>
          <span className="font-semibold">Max files:</span> {maxFiles}
        </div>
      </div>
    </div>
  );
}
