import { PublicQuestion } from "@/lib/publicSurvey";

export function QuestionCard({
  q,
  index,
  answer,
  onSetText,
  onSetSingle,
  onToggleMulti,
}: {
  q: PublicQuestion;
  index: number;
  answer: any;
  onSetText: (qid: string, text: string) => void;
  onSetSingle: (qid: string, value: string) => void;
  onToggleMulti: (qid: string, value: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-6 ring-1 ring-navy/5">
      <div className="text-sm text-navy/60">
        Q{index + 1} · {q.type} {q.required ? "· required" : ""}
      </div>
      <div className="mt-2 font-medium text-navy">{q.title}</div>

      {/* TEXT */}
      {q.type === "text" ? (
        <input
          value={answer?.text ?? ""}
          onChange={(e) => onSetText(q.id, e.target.value)}
          placeholder="Type your answer…"
          className="mt-3 w-full rounded-xl bg-lavender px-4 py-3 text-sm text-navy outline-none ring-1 ring-navy/10 focus:ring-2 focus:ring-mint/60"
        />
      ) : null}

      {/* SINGLE */}
      {q.type === "single" ? (
        <div className="mt-3 space-y-2">
          {(q.options_json?.options ?? []).map((opt) => {
            const selected = answer?.value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSetSingle(q.id, opt)}
                className={[
                  "w-full rounded-xl px-4 py-3 text-left text-sm ring-1 transition",
                  selected
                    ? "bg-mint/15 text-navy ring-mint/40"
                    : "bg-lavender text-navy/80 ring-navy/10 hover:ring-navy/20",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* MULTI */}
      {q.type === "multi" ? (
        <div className="mt-3 space-y-2">
          {(q.options_json?.options ?? []).map((opt) => {
            const selected = Array.isArray(answer?.values) ? answer.values.includes(opt) : false;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleMulti(q.id, opt)}
                className={[
                  "w-full rounded-xl px-4 py-3 text-left text-sm ring-1 transition",
                  selected
                    ? "bg-mint/15 text-navy ring-mint/40"
                    : "bg-lavender text-navy/80 ring-navy/10 hover:ring-navy/20",
                ].join(" ")}
              >
                {selected ? "✓ " : ""}{opt}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* IMAGE placeholder */}
      {q.type === "image" ? (
        <div className="mt-3 rounded-xl bg-lavender px-4 py-3 text-sm text-navy/60 ring-1 ring-navy/10">
          Image upload not implemented yet (max: {q.max_images ?? 1})
        </div>
      ) : null}
    </div>
  );
}
