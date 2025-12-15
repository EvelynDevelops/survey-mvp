"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import {
  getPublicSurvey,
  resumePublicResponse,
  getPublicResponse,
  putPublicAnswers,
  submitPublicResponse,
  type PublicSurvey,
} from "@/lib/publicSurvey";

import { SurveyHeaderCard } from "@/components/public-survey/SurveyHeaderCard";
import { QuestionCard } from "@/components/public-survey/QuestionCard";
import { SubmitBar } from "@/components/public-survey/SubmitBar";

const keyForSlug = (slug: string) => `respondent_key:${slug}`;

export default function PublicSurveyPage() {
  const { slug } = useParams<{ slug: string }>();

  const [survey, setSurvey] = React.useState<PublicSurvey | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [responseId, setResponseId] = React.useState<string | null>(null);
  const [respondentKey, setRespondentKey] = React.useState<string | null>(null);
  const [answersByQid, setAnswersByQid] = React.useState<Record<string, any>>({});

  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  // Load survey
  React.useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setError(null);
        setSurvey(await getPublicSurvey(slug));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load survey");
      }
    })();
  }, [slug]);

  // Resume/create response
  React.useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const existingKey = typeof window !== "undefined" ? localStorage.getItem(keyForSlug(slug)) : null;
        const resumed = await resumePublicResponse(slug, existingKey);
        setResponseId(resumed.response_id);
        setRespondentKey(resumed.respondent_key);
        if (typeof window !== "undefined") localStorage.setItem(keyForSlug(slug), resumed.respondent_key);
      } catch (e: any) {
        setError(e?.message ?? "Failed to start response");
      }
    })();
  }, [slug]);

  // Fetch existing answers (refresh-safe)
  React.useEffect(() => {
    if (!responseId || !respondentKey) return;
    (async () => {
      try {
        const res = await getPublicResponse(responseId, respondentKey);
        const mapped: Record<string, any> = {};
        for (const a of res.answers || []) mapped[a.question_id] = a.answer_json;
        setAnswersByQid(mapped);
        if (res.status === "submitted") setSubmitted(true);
      } catch {
        // ignore
      }
    })();
  }, [responseId, respondentKey]);

  const onSetText = (qid: string, text: string) =>
    setAnswersByQid((p) => ({ ...p, [qid]: { text } }));

  const onSetSingle = (qid: string, value: string) =>
    setAnswersByQid((p) => ({ ...p, [qid]: { value } }));

  const onToggleMulti = (qid: string, value: string) =>
    setAnswersByQid((p) => {
      const cur: string[] = Array.isArray(p[qid]?.values) ? p[qid].values : [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...p, [qid]: { values: next } };
    });

  const validateRequired = React.useCallback(() => {
    if (!survey) return [];
    const missing: string[] = [];
    for (const q of survey.questions) {
      if (!q.required) continue;
      const ans = answersByQid[q.id];
      const ok =
        (q.type === "text" && typeof ans?.text === "string" && ans.text.trim().length > 0) ||
        (q.type === "single" && typeof ans?.value === "string" && ans.value.length > 0) ||
        (q.type === "multi" && Array.isArray(ans?.values) && ans.values.length > 0) ||
        (q.type === "image" && Array.isArray(ans?.files) && ans.files.length > 0);
      if (!ok) missing.push(q.title);
    }
    return missing;
  }, [survey, answersByQid]);

  const onSubmit = React.useCallback(async () => {
    if (!survey || !responseId) return;

    const missing = validateRequired();
    if (missing.length > 0) {
      alert(`Please answer required questions:\n- ${missing.join("\n- ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: survey.questions
          .filter((q) => answersByQid[q.id] !== undefined)
          .map((q) => ({ question_id: q.id, answer: answersByQid[q.id] })),
      };

      await putPublicAnswers(responseId, payload);
      await submitPublicResponse(responseId);

      setSubmitted(true);
    } catch (e: any) {
      alert(e?.message ?? "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }, [survey, responseId, answersByQid, validateRequired]);

  if (error) return <div className="p-6">Error: {error}</div>;
  if (!survey) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-lavender px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <SurveyHeaderCard survey={survey} submitted={submitted} />

        {submitted ? (
          <div className="rounded-2xl bg-white/70 p-6 ring-1 ring-navy/5">
            <div className="text-lg font-semibold text-navy">Thanks!</div>
            <div className="mt-1 text-sm text-navy/60">Your response has been submitted.</div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {survey.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={idx}
                  answer={answersByQid[q.id]}
                  onSetText={onSetText}
                  onSetSingle={onSetSingle}
                  onToggleMulti={onToggleMulti}
                />
              ))}
            </div>

            <SubmitBar
              disabled={submitting || !responseId}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
}
