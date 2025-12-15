"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BuilderShell } from "@/components/survey-builder/BuilderShell";
import { BuilderTopBar } from "@/components/survey-builder/BuilderTopBar";
import { QuestionList } from "@/components/survey-builder/canvas/QuestionList";
import { SidePanel } from "@/components/survey-builder/side-panel/SidePanel";
import { PublishSuccessModal } from "@/components/survey-builder/PublishSuccessModal";

import { useSurveyBuilder } from "@/hooks/useSurveyBuilder";
import { validateSurvey } from "@/lib/survey-builder/validators";
import type { Survey } from "@/lib/survey-builder/types";

import { publishSurveyFlow } from "@/lib/surveysAdmin";

const STORAGE_KEY = "surveyBuilderDraft";

export default function NewSurveyPage() {
  const router = useRouter();

  // 1) Load draft once on mount
  const [draft, setDraft] = React.useState<Survey | undefined>(undefined);
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Survey;
      setDraft(parsed);
    } catch {
      // ignore
    }
  }, []);

  // 2) Initialize builder with draft if present
  const {
    survey,
    questions,
    selectedQuestionId,
    selectedQuestion,

    questionCount,
    canAddQuestion,

    saveStatus,
    error,

    setTitle,
    addQuestion,

    selectQuestion,
    updateQuestion,

    deleteQuestion,
    duplicateQuestion,
    moveQuestionUp,
    moveQuestionDown,

    updateSelectedQuestion,
    deleteSelectedQuestion,
    duplicateSelectedQuestion,

    clearError,
    setSaveStatus,
  } = useSurveyBuilder(draft ? { survey: draft } : undefined);

  // 3) Autosave draft (debounced)
  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
        if (saveStatus === "dirty") setSaveStatus("saved");
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(t);
  }, [survey, saveStatus, setSaveStatus]);

  // Publish modal state
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishResult, setPublishResult] = React.useState<{ id: string; slug: string } | null>(
    null
  );

  const publicLink = React.useMemo(() => {
    if (!publishResult) return "";

    return `${window.location.origin}/public/surveys/${publishResult.slug}`;
  }, [publishResult]);

  const handlePreview = React.useCallback(() => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
    router.push("/surveys/preview");
  }, [survey, router]);

  const handlePublish = React.useCallback(async () => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setIsPublishing(true);
      setSaveStatus("saving");

      const res = await publishSurveyFlow(survey);

      // clear draft
      sessionStorage.removeItem(STORAGE_KEY);
      setSaveStatus("saved");

      // open success modal
      setPublishResult({ id: res.id, slug: res.slug });
    } catch (err) {
      setSaveStatus("error");
      alert(err instanceof Error ? err.message : "Failed to publish survey");
    } finally {
      setIsPublishing(false);
    }
  }, [survey, setSaveStatus]);

  const goDashboard = React.useCallback(() => {
    if (!publishResult) return;
    router.push(`/surveys/${publishResult.id}/dashboard`);
  }, [publishResult, router]);

  return (
    <>
      <BuilderShell
        topBar={
          <BuilderTopBar
            title={survey.title}
            onTitleChange={(t) => {
              setTitle(t);
              setSaveStatus("dirty");
            }}
            questionCount={questionCount}
            canAddQuestion={canAddQuestion && !isPublishing}
            saveStatus={saveStatus}
            error={error}
            onClearError={clearError}
            onAddQuestion={(type) => {
              addQuestion(type);
              setSaveStatus("dirty");
            }}
            onPreview={isPublishing ? undefined : handlePreview}
            onPublish={isPublishing ? undefined : handlePublish}
          />
        }
        canvas={
          <QuestionList
            questions={questions}
            selectedQuestionId={selectedQuestionId}
            onSelect={selectQuestion}
            onUpdate={(id, patch) => {
              updateQuestion(id, patch);
              setSaveStatus("dirty");
            }}
            onDelete={(id) => {
              deleteQuestion(id);
              setSaveStatus("dirty");
            }}
            onDuplicate={(id) => {
              duplicateQuestion(id);
              setSaveStatus("dirty");
            }}
            onMoveUp={(id) => {
              moveQuestionUp(id);
              setSaveStatus("dirty");
            }}
            onMoveDown={(id) => {
              moveQuestionDown(id);
              setSaveStatus("dirty");
            }}
          />
        }
        sidePanel={
          <SidePanel
            selectedQuestion={selectedQuestion}
            onUpdateSelected={(patch) => {
              updateSelectedQuestion(patch);
              setSaveStatus("dirty");
            }}
            onDeleteSelected={() => {
              deleteSelectedQuestion();
              setSaveStatus("dirty");
            }}
            onDuplicateSelected={() => {
              duplicateSelectedQuestion();
              setSaveStatus("dirty");
            }}
          />
        }
      />

      <PublishSuccessModal
        open={!!publishResult}
        publicLink={publicLink}
        onClose={goDashboard}
        onGoDashboard={goDashboard}
      />
    </>
  );
}
