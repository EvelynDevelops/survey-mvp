// frontend/lib/surveysAdmin.ts
import { api } from "@/lib/api";
import type { Survey, Question } from "@/lib/survey-builder/types";

type SurveyResponse = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  slug?: string | null;
};

type PublishSurveyResponse = {
  id: string;
  status: "published";
  slug: string;
};

type CreateSurveyRequest = {
  title: string;
  description?: string | null;
};

type CreateQuestionRequest = {
  type: "single" | "multi" | "text" | "image";
  title: string;
  required: boolean;
  position: number;

  // for single/multi
  options?: string[];

  // for image
  max_images?: number;
};

function mapQuestionType(t: Question["type"]): CreateQuestionRequest["type"] {
  // Frontend uses "multiple", backend expects "multi"
  if (t === "multiple") return "multi";
  return t;
}

function toCreateQuestionRequest(q: Question, position: number): CreateQuestionRequest {
  const type = mapQuestionType(q.type);

  switch (q.type) {
    case "single":
    case "multiple": {
      const options = q.options
        .map((o) => o.label.trim())
        .filter(Boolean);

      return {
        type, // "single" or "multi"
        title: q.title ?? "",
        required: q.required,
        position,
        options,
      };
    }

    case "image": {
      return {
        type: "image",
        title: q.title ?? "",
        required: q.required,
        position,
        max_images: q.upload.maxFiles,
      };
    }

    case "text": {
      return {
        type: "text",
        title: q.title ?? "",
        required: q.required,
        position,
      };
    }

    default: {
      // Exhaustiveness check (TS will error if a new type is added and not handled)
      const _never: never = q;
      return _never;
    }
  }
}

export async function createSurveyDraft(input: CreateSurveyRequest): Promise<SurveyResponse> {
  return api.post<SurveyResponse>("/surveys", input);
}

export async function createSurveyQuestion(
  surveyId: string,
  req: CreateQuestionRequest
) {
  return api.post(`/surveys/${surveyId}/questions`, req);
}

export async function publishSurveyById(surveyId: string): Promise<PublishSurveyResponse> {
  return api.post<PublishSurveyResponse>(`/surveys/${surveyId}/publish`, {});
}

/**
 * One-click publish:
 * 1) create draft survey
 * 2) create questions in order
 * 3) publish -> returns slug
 */
export async function publishSurveyFlow(survey: Survey): Promise<PublishSurveyResponse> {
  const created = await createSurveyDraft({
    title: survey.title?.trim() ? survey.title : "Untitled survey",
    description: survey.description ?? null,
  });

  const surveyId = created.id;

  // Use array order as position (backend expects 0..n)
  for (let i = 0; i < survey.questions.length; i++) {
    const q = survey.questions[i];
    const req = toCreateQuestionRequest(q, i);
    await createSurveyQuestion(surveyId, req);
  }

  return publishSurveyById(surveyId);
}
