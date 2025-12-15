"use client";

import * as React from "react";

import { BuilderShell } from "@/components/survey-builder/BuilderShell";
import { BuilderTopBar } from "@/components/survey-builder/BuilderTopBar";
import { QuestionList } from "@/components/survey-builder/canvas/QuestionList";
import { SidePanel } from "@/components/survey-builder/side-panel/SidePanel";

import { useSurveyBuilder } from "@/hooks/useSurveyBuilder";

export default function NewSurveyPage() {
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
  } = useSurveyBuilder();

  // Optional: clear error automatically (BuilderTopBar also supports onClearError)
  React.useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => clearError(), 3000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  return (
    <BuilderShell
      topBar={
        <BuilderTopBar
          title={survey.title}
          onTitleChange={setTitle}
          questionCount={questionCount}
          canAddQuestion={canAddQuestion}
          saveStatus={saveStatus}
          error={error}
          onClearError={clearError}
          onAddQuestion={addQuestion}
          // onPreview={() => {}}
          // onPublish={() => {}}
        />
      }
      canvas={
        <QuestionList
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onSelect={selectQuestion}
          onUpdate={updateQuestion}
          onDelete={deleteQuestion}
          onDuplicate={duplicateQuestion}
          onMoveUp={moveQuestionUp}
          onMoveDown={moveQuestionDown}
        />
      }
      sidePanel={
        <SidePanel
          selectedQuestion={selectedQuestion}
          onUpdateSelected={updateSelectedQuestion}
          onDeleteSelected={deleteSelectedQuestion}
          onDuplicateSelected={duplicateSelectedQuestion}
        />
      }
    />
  );
}
