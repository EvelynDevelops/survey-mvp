"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BuilderShell } from "@/components/survey-builder/BuilderShell";
import { BuilderTopBar } from "@/components/survey-builder/BuilderTopBar";
import { QuestionList } from "@/components/survey-builder/canvas/QuestionList";
import { SidePanel } from "@/components/survey-builder/side-panel/SidePanel";

import { useSurveyBuilder } from "@/hooks/useSurveyBuilder";
import { validateSurvey } from "@/lib/survey-builder/validators";
import type { Survey } from "@/lib/survey-builder/types";

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
        // optional: mark saved (purely UI)
        if (saveStatus === "dirty") setSaveStatus("saved");
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(t);
  }, [survey, saveStatus, setSaveStatus]);

  const handlePreview = React.useCallback(() => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
    router.push("/surveys/preview");
  }, [survey, router]);

  const handlePublish = React.useCallback(() => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    alert("Publish is valid ✅ (TODO: implement publish API)");
  }, [survey]);

  return (
    <BuilderShell
      topBar={
        <BuilderTopBar
          title={survey.title}
          onTitleChange={(t) => {
            setTitle(t);
            setSaveStatus("dirty");
          }}
          questionCount={questionCount}
          canAddQuestion={canAddQuestion}
          saveStatus={saveStatus}
          error={error}
          onClearError={clearError}
          onAddQuestion={(type) => {
            addQuestion(type);
            setSaveStatus("dirty");
          }}
          onPreview={handlePreview}
          onPublish={handlePublish}
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
  );
}
