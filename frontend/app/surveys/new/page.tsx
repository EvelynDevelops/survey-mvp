"use client";

import * as React from "react";

import { BuilderShell } from "@/components/survey-builder/BuilderShell";
import { BuilderTopBar } from "@/components/survey-builder/BuilderTopBar";
import { QuestionList } from "@/components/survey-builder/canvas/QuestionList";
import { SidePanel } from "@/components/survey-builder/side-panel/SidePanel";

import { useSurveyBuilder } from "@/hooks/useSurveyBuilder";
import { validateSurvey } from "@/lib/survey-builder/validators";

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

  const handlePreview = React.useCallback(() => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // TODO: route to preview page (read-only rendering)
    alert("Preview is valid ✅ (TODO: implement preview page)");
  }, [survey]);

  const handlePublish = React.useCallback(() => {
    const errors = validateSurvey(survey);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // TODO: call publish API
    alert("Publish is valid ✅ (TODO: implement publish API)");
  }, [survey]);

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
          onPreview={handlePreview}
          onPublish={handlePublish}
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
