"use client";

import type { Survey } from "@/lib/survey-builder/types";
import { PreviewQuestionCard } from "./PreviewQuestionCard";

type Props = {
  survey: Survey;
};

export function SurveyPreviewCard({ survey }: Props) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white shadow-sm">
      <div className="p-8 border-b">
        <h1 className="text-3xl font-bold text-navy">{survey.title}</h1>
        {survey.description?.trim() ? (
          <p className="mt-2 text-slate-600 max-w-2xl">{survey.description}</p>
        ) : (
          <p className="mt-2 text-slate-600 max-w-2xl">
            A quick preview of how your survey will look to respondents.
          </p>
        )}
      </div>

      <div className="p-8 space-y-6">
        {survey.questions.map((q, idx) => (
          <PreviewQuestionCard key={q.id} question={q} index={idx} />
        ))}

        <div className="pt-2">
          <button
            disabled
            className="w-full rounded-xl bg-navy/10 px-4 py-3 text-sm font-semibold text-navy/60 cursor-not-allowed"
            title="Preview mode (disabled)"
          >
            Submit (disabled in preview)
          </button>
        </div>
      </div>
    </div>
  );
}
