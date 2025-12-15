// frontend/components/survey-builder/canvas/QuestionRenderer.tsx

"use client";

import * as React from "react";
import type { Question } from "@/lib/survey-builder/types";

import { SingleChoiceQuestionView } from "./questions/SingleChoiceQuestionView";
import { MultipleChoiceQuestionView } from "./questions/MultipleChoiceQuestionView";
import { TextQuestionView } from "./questions/TextQuestionView";
import { ImageUploadQuestionView } from "./questions/ImageUploadQuestionView";

type Props = {
  question: Question;
};

export function QuestionRenderer({ question }: Props) {
  switch (question.type) {
    case "single":
      return <SingleChoiceQuestionView question={question} />;
    case "multiple":
      return <MultipleChoiceQuestionView question={question} />;
    case "text":
      return <TextQuestionView question={question} />;
    case "image":
      return <ImageUploadQuestionView question={question} />;
    default:
      return null;
  }
}
