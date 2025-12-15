// frontend/components/survey-builder/QuestionCountBadge.tsx

"use client";

type Props = {
  count: number;
  max?: number;
};

export function QuestionCountBadge({ count, max = 100 }: Props) {
  const isMaxed = count >= max;

  return (
    <span
      className={[
        "text-sm px-2 py-1 rounded-md border",
        isMaxed
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-slate-50 border-slate-200 text-slate-700",
      ].join(" ")}
    >
      {count}/{max}
    </span>
  );
}
