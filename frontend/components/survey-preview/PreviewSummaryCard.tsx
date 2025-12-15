"use client";

import type { Question } from "@/lib/survey-builder/types";

type Props = {
  questions: Question[];
  onEdit: () => void;
  onShare?: () => void;
};

export function PreviewSummaryCard({ questions, onEdit, onShare }: Props) {
  const requiredCount = questions.filter((q) => q.required).length;
  const typeCount = new Set(questions.map((q) => q.type)).size;

  return (
    <div className="rounded-2xl border border-white/70 bg-white shadow-sm p-6 h-fit sticky top-[96px]">
      <div className="text-sm font-semibold text-navy">Summary</div>

      <div className="mt-3 space-y-3">
        <StatRow label="Questions" value={`${questions.length}`} />
        <StatRow label="Required" value={`${requiredCount}`} />
        <StatRow label="Types" value={`${typeCount} kind(s)`} />
      </div>

      <div className="mt-6 rounded-xl bg-soft_mint p-4">
        <div className="text-sm font-semibold text-navy">Tip</div>
        <p className="mt-1 text-sm text-navy/80">
          Preview is read-only. Go back to tweak wording, options, and required fields.
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Edit
        </button>

        {onShare ? (
          <button
            onClick={onShare}
            className="flex-1 rounded-md bg-purple px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Share
          </button>
        ) : null}
      </div>

      {onShare ? (
        <div className="mt-4 text-xs text-slate-500">
          (Share is placeholder — you’ll add a real link after publish.)
        </div>
      ) : null}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-sm font-semibold text-navy">{value}</div>
    </div>
  );
}
