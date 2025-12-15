"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useSurveyDraft } from "@/hooks/useSurveyDraft";
import { PreviewTopBar } from "@/components/survey-preview/PreviewTopBar";
import { SurveyPreviewCard } from "@/components/survey-preview/SurveyPreviewCard";
import { PreviewSummaryCard } from "@/components/survey-preview/PreviewSummaryCard";
import { isAuthenticated } from "@/lib/auth";

export default function SurveyPreviewPage() {
  const router = useRouter();
  const { survey, isLoaded } = useSurveyDraft({ storageKey: "surveyBuilderDraft" });

  // Check authentication on mount
  React.useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/surveys/preview');
    }
  }, [router]);

  const onBack = React.useCallback(() => {
    router.push("/surveys/new");
  }, [router]);

  if (!isLoaded) {
    return <div className="min-h-[calc(100vh-64px)] bg-lavender" />;
  }

  if (!survey) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-lavender">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-white/70 bg-white shadow-sm p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-soft_mint px-3 py-1 text-xs font-semibold text-navy">
              Preview
            </div>
            <h1 className="mt-4 text-2xl font-bold text-navy">Nothing to preview</h1>
            <p className="mt-2 text-slate-600">
              Go back to the builder and click Preview again.
            </p>

            <button
              onClick={onBack}
              className="mt-6 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Back to builder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-lavender">
      <PreviewTopBar
        title={survey.title}
        onBack={onBack}
        onPublish={() => alert("TODO: publish")}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SurveyPreviewCard survey={survey} />
          <PreviewSummaryCard
            questions={survey.questions}
            onEdit={onBack}
            onShare={() => alert("TODO: share")}
          />
        </div>
      </div>
    </div>
  );
}
