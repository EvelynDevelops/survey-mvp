// frontend/lib/survey-builder/questionFactory.ts

import type {
    ChoiceOption,
    Question,
    QuestionByType,
    QuestionType,
    Survey,
  } from "./types";
  
  /**
   * Simple ID generator for MVP.
   * In production you might use crypto.randomUUID() (browser) or a uuid lib.
   */
  function genId(prefix: string) {
    // Example: q_k9l2x8_1734240000000
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;
  }
  
  function nowIso() {
    return new Date().toISOString();
  }
  
  export function createSurvey(overrides?: Partial<Survey>): Survey {
    const iso = nowIso();
    return {
      id: genId("s"),
      title: "Untitled survey",
      description: "",
      questions: [],
      createdAt: iso,
      updatedAt: iso,
      version: 1,
      ...overrides,
    };
  }
  
  function createOption(label: string): ChoiceOption {
    return { id: genId("o"), label };
  }
  
  /**
   * Default question templates by type.
   * Keep these defaults "reasonable and editable".
   */
  export function createQuestion<T extends QuestionType>(
    type: T,
    overrides?: Partial<QuestionByType[T]>
  ): QuestionByType[T] {
    const base = {
      id: genId("q"),
      type,
      title: "",
      description: "",
      required: false,
    };
  
    switch (type) {
      case "single": {
        const q: QuestionByType["single"] = {
          ...base,
          type: "single",
          title: "Single choice question",
          options: [createOption("Option 1"), createOption("Option 2")],
        };
        return { ...q, ...(overrides as Partial<QuestionByType["single"]>) } as any;
      }
  
      case "multiple": {
        const q: QuestionByType["multiple"] = {
          ...base,
          type: "multiple",
          title: "Multiple choice question",
          options: [createOption("Option 1"), createOption("Option 2")],
          constraints: undefined,
        };
        return { ...q, ...(overrides as Partial<QuestionByType["multiple"]>) } as any;
      }
  
      case "text": {
        const q: QuestionByType["text"] = {
          ...base,
          type: "text",
          title: "Text question",
          placeholder: "Type your answer here…",
          constraints: undefined,
        };
        return { ...q, ...(overrides as Partial<QuestionByType["text"]>) } as any;
      }
  
      case "image": {
        const q: QuestionByType["image"] = {
          ...base,
          type: "image",
          title: "Image upload",
          upload: {
            accept: ["image/png", "image/jpeg", "image/webp"],
            maxSizeBytes: 5 * 1024 * 1024, // 5MB
            maxFiles: 1,
          },
        };
        return { ...q, ...(overrides as Partial<QuestionByType["image"]>) } as any;
      }
  
      default: {
        // Exhaustiveness check
        const _exhaustive: never = type;
        throw new Error(`Unsupported question type: ${_exhaustive}`);
      }
    }
  }
  
  /**
   * Convenience helper: strongly typed clone with new IDs.
   * Useful for "Duplicate question".
   */
  export function duplicateQuestion(q: Question): Question {
    const newId = genId("q");
  
    if (q.type === "single" || q.type === "multiple") {
      return {
        ...q,
        id: newId,
        options: q.options.map((opt) => ({
          ...opt,
          id: genId("o"),
        })),
      };
    }
  
    return {
      ...q,
      id: newId,
    };
  }
  