// frontend/lib/survey-builder/types.ts

export const MAX_QUESTIONS = 100;

export type QuestionId = string;

export type SurveyStatus = "draft" | "published";

export type QuestionType = "single" | "multiple" | "text" | "image";

export type ChoiceOption = {
  id: string;
  label: string;
};

export type ImageUploadConfig = {
  /** Allowed mime types (or wildcards like "image/*") */
  accept: string[];
  /** Max number of files */
  maxFiles: number;
  /** Max size per file in bytes */
  maxSizeBytes: number;
};

export type BaseQuestion = {
  id: string;
  type: QuestionType;

  title: string;
  description?: string;

  required: boolean;

  /**
   * Optional client-only fields you may want later.
   * Keep it optional so it doesn't break persistence/publish.
   */
  clientMeta?: {
    createdAt?: number;
    updatedAt?: number;
  };
};

export type SingleChoiceQuestion = BaseQuestion & {
  type: "single";
  options: ChoiceOption[];
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple";
  options: ChoiceOption[];
  constraints?: {
    maxSelected?: number;
  };
};

export type TextQuestion = BaseQuestion & {
  type: "text";
  placeholder?: string;
  /**
   * Optional: if you later want textarea vs input
   */
  multiline?: boolean;
  maxLength?: number;
  constraints?: {
    maxLength?: number;
    minLength?: number;
  };
};

export type ImageUploadQuestion = BaseQuestion & {
  type: "image";
  upload: ImageUploadConfig;
};

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | ImageUploadQuestion;

export type QuestionByType = {
  single: SingleChoiceQuestion;
  multiple: MultipleChoiceQuestion;
  text: TextQuestion;
  image: ImageUploadQuestion;
};

export type Survey = {
  id: string;
  title: string;
  description?: string;

  status?: SurveyStatus;
  slug?: string;

  questions: Question[];

  createdAt?: number | string;
  updatedAt?: number | string;
  version?: number;
};

/** Type guards (optional helpers; nice for non-TSX files) */
export function isChoiceQuestion(
  q: Question
): q is SingleChoiceQuestion | MultipleChoiceQuestion {
  return q.type === "single" || q.type === "multiple";
}

export function isImageQuestion(q: Question): q is ImageUploadQuestion {
  return q.type === "image";
}

export function isTextQuestion(q: Question): q is TextQuestion {
  return q.type === "text";
}
