// frontend/lib/survey-builder/validators.ts

import type { Survey, Question } from "./types";

export function validateSurvey(survey: Survey): string[] {
  const errors: string[] = [];

  if (!survey.title.trim()) {
    errors.push("Survey title is required.");
  }

  if (survey.questions.length === 0) {
    errors.push("Survey must contain at least one question.");
  }

  survey.questions.forEach((q, idx) => {
    validateQuestion(q, idx, errors);
  });

  return errors;
}

function validateQuestion(
  question: Question,
  index: number,
  errors: string[]
) {
  if (!question.title.trim()) {
    errors.push(`Question ${index + 1} is missing a title.`);
  }

  if (
    (question.type === "single" || question.type === "multiple") &&
    question.options.length < 2
  ) {
    errors.push(`Question ${index + 1} must have at least 2 options.`);
  }
}
