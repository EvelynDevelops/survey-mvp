import { api } from "@/lib/api";

export type PublicQuestion = {
  id: string;
  type: "single" | "multi" | "text" | "image";
  title: string;
  required: boolean;
  position: number;
  options_json?: { options?: string[] } | null;
  max_images?: number | null;
};

export type PublicSurvey = {
  id: string;
  title: string;
  description?: string | null;
  questions: PublicQuestion[];
};

export type ResumeResponse = {
  response_id: string;
  respondent_key: string;
  status?: string;
  is_new?: boolean;
};

export type GetResponseResponse = {
  response_id: string;
  survey_id: string;
  status: "in_progress" | "submitted";
  respondent_key: string;
  started_at: string;
  submitted_at: string | null;
  answers: { question_id: string; answer_json: any }[];
};

export type SubmitAnswersRequest = {
  answers: { question_id: string; answer: any }[];
};

export function getPublicSurvey(slug: string) {
  return api.get<PublicSurvey>(`/public/surveys/${slug}`);
}

export function resumePublicResponse(slug: string, respondent_key?: string | null) {
  return api.post<ResumeResponse>(
    `/public/surveys/${slug}/responses/resume`,
    respondent_key ? { respondent_key } : {}
  );
}

export function getPublicResponse(responseId: string, respondentKey: string) {
  return api.get<GetResponseResponse>(
    `/public/responses/${responseId}?respondent_key=${respondentKey}`
  );
}

export function putPublicAnswers(responseId: string, payload: SubmitAnswersRequest) {
  return api.put(`/public/responses/${responseId}/answers`, payload);
}

export function submitPublicResponse(responseId: string) {
  return api.post(`/public/responses/${responseId}/submit`, {});
}
