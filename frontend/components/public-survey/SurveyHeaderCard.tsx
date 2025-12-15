import { PublicSurvey } from "@/lib/publicSurvey";

export function SurveyHeaderCard({ survey, submitted }: { survey: PublicSurvey; submitted: boolean }) {
  return (
    <div className="rounded-2xl bg-white/70 p-6 ring-1 ring-navy/5">
      <h1 className="text-2xl font-semibold text-navy">{survey.title}</h1>
      {survey.description ? (
        <p className="mt-2 text-sm text-navy/60">{survey.description}</p>
      ) : null}
      <div className="mt-3 text-xs text-navy/40">{submitted ? "Submitted" : "In progress"}</div>
    </div>
  );
}
