// frontend/lib/survey-builder/types.ts

export const MAX_QUESTIONS = 100 as const;

export type SurveyId = string;
export type QuestionId = string;
export type OptionId = string;

export type QuestionType = "single" | "multiple" | "text" | "image";

/**
 * A survey contains a list of questions.
 * "version" is useful if you later want migrations.
 */
export type Survey = {
  id: SurveyId;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  version: number;
};

/**
 * Shared fields across all question types.
 */
export type BaseQuestion = {
  id: QuestionId;
  type: QuestionType;
  title: string; // question prompt
  description?: string;
  required: boolean;
};

/**
 * Choice option used by single/multiple choice questions.
 */
export type ChoiceOption = {
  id: OptionId;
  label: string;
};

/**
 * 1) Single choice question
 */
export type SingleChoiceQuestion = BaseQuestion & {
  type: "single";
  options: ChoiceOption[];
  /**
   * Optional extras you can add later:
   * randomizeOptions?: boolean;
   * allowOther?: boolean;
   */
};

/**
 * 2) Multiple choice question
 */
export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple";
  options: ChoiceOption[];
  /**
   * Optional constraints (nice-to-have)
   * If you don't want this now, keep it undefined.
   */
  constraints?: {
    minSelected?: number;
    maxSelected?: number;
  };
  /**
   * Optional extras:
   * randomizeOptions?: boolean;
   * allowOther?: boolean;
   */
};

/**
 * 3) Text (open-ended) question
 * You called it "描述" - typically it's an open text response.
 */
export type TextQuestion = BaseQuestion & {
  type: "text";
  placeholder?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
  };
};

/**
 * 4) Image upload question (respondent uploads an image)
 */
export type ImageUploadQuestion = BaseQuestion & {
  type: "image";
  upload: {
    /**
     * MIME types or simple extensions. Keep it simple for MVP.
     * Example: ["image/png", "image/jpeg"]
     */
    accept: string[];
    /**
     * Max file size in bytes.
     * Example: 5MB = 5 * 1024 * 1024
     */
    maxSizeBytes: number;
    /**
     * Max number of images allowed (MVP can use 1).
     */
    maxFiles: number;
  };
};

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | ImageUploadQuestion;

/**
 * Helper type: map question type -> concrete question type
 * Useful for factories and type-safe updates.
 */
export type QuestionByType = {
  single: SingleChoiceQuestion;
  multiple: MultipleChoiceQuestion;
  text: TextQuestion;
  image: ImageUploadQuestion;
};
