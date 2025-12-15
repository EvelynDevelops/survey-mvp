// frontend/hooks/useSurveyBuilder.ts

import * as React from "react";
import { MAX_QUESTIONS, type Question, type QuestionId, type QuestionType, type Survey } from "@/lib/survey-builder/types";
import { createSurvey, createQuestion, duplicateQuestion as dupQ } from "@/lib/survey-builder/questionFactory";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type BuilderState = {
  survey: Survey;
  selectedQuestionId: QuestionId | null;
  saveStatus: SaveStatus;
  error: string | null;
};

type InitArgs = {
  survey?: Survey; // if editing existing survey
};

type Action =
  | { type: "INIT"; payload: { survey: Survey } }
  | { type: "SET_TITLE"; payload: { title: string } }
  | { type: "SET_DESCRIPTION"; payload: { description: string } }
  | { type: "SELECT_QUESTION"; payload: { id: QuestionId | null } }
  | { type: "ADD_QUESTION"; payload: { qType: QuestionType } }
  | { type: "UPDATE_QUESTION"; payload: { id: QuestionId; patch: Partial<Question> } }
  | { type: "DELETE_QUESTION"; payload: { id: QuestionId } }
  | { type: "DUPLICATE_QUESTION"; payload: { id: QuestionId } }
  | { type: "MOVE_QUESTION"; payload: { id: QuestionId; direction: "up" | "down" } }
  | { type: "SET_SAVE_STATUS"; payload: { status: SaveStatus; error?: string | null } }
  | { type: "CLEAR_ERROR" };

function touchSurvey(survey: Survey): Survey {
  return { ...survey, updatedAt: new Date().toISOString() };
}

function markDirty(state: BuilderState): BuilderState {
  // "saving" should not be overridden by dirty automatically;
  // but for MVP we can keep it simple.
  if (state.saveStatus === "saving") return state;
  return { ...state, saveStatus: "dirty" };
}

function findIndexById(questions: Question[], id: QuestionId) {
  return questions.findIndex((q) => q.id === id);
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "INIT": {
      return {
        survey: action.payload.survey,
        selectedQuestionId: action.payload.survey.questions[0]?.id ?? null,
        saveStatus: "idle",
        error: null,
      };
    }

    case "SET_TITLE": {
      const survey = touchSurvey({ ...state.survey, title: action.payload.title });
      return markDirty({ ...state, survey, error: null });
    }

    case "SET_DESCRIPTION": {
      const survey = touchSurvey({ ...state.survey, description: action.payload.description });
      return markDirty({ ...state, survey, error: null });
    }

    case "SELECT_QUESTION": {
      return { ...state, selectedQuestionId: action.payload.id, error: null };
    }

    case "ADD_QUESTION": {
      const questions = state.survey.questions;

      if (questions.length >= MAX_QUESTIONS) {
        return { ...state, error: `You’ve reached the ${MAX_QUESTIONS}-question limit.` };
      }

      const newQ = createQuestion(action.payload.qType) as Question;
      const nextQuestions = [...questions, newQ];

      const survey = touchSurvey({ ...state.survey, questions: nextQuestions });
      return markDirty({
        ...state,
        survey,
        selectedQuestionId: newQ.id,
        error: null,
      });
    }

    case "UPDATE_QUESTION": {
      const idx = findIndexById(state.survey.questions, action.payload.id);
      if (idx === -1) return state;

      // Note: patch is Partial<Question>. You should only pass fields that make sense for that question type.
      const nextQuestions = state.survey.questions.map((q) =>
        q.id === action.payload.id ? ({ ...q, ...action.payload.patch } as Question) : q
      );

      const survey = touchSurvey({ ...state.survey, questions: nextQuestions });
      return markDirty({ ...state, survey, error: null });
    }

    case "DELETE_QUESTION": {
      const nextQuestions = state.survey.questions.filter((q) => q.id !== action.payload.id);

      // If the deleted question was selected, choose a nearby one.
      let nextSelected: QuestionId | null = state.selectedQuestionId;
      if (state.selectedQuestionId === action.payload.id) {
        nextSelected = nextQuestions[0]?.id ?? null;
      }

      const survey = touchSurvey({ ...state.survey, questions: nextQuestions });
      return markDirty({ ...state, survey, selectedQuestionId: nextSelected, error: null });
    }

    case "DUPLICATE_QUESTION": {
      const idx = findIndexById(state.survey.questions, action.payload.id);
      if (idx === -1) return state;

      if (state.survey.questions.length >= MAX_QUESTIONS) {
        return { ...state, error: `You’ve reached the ${MAX_QUESTIONS}-question limit.` };
      }

      const original = state.survey.questions[idx];
      const copy = dupQ(original);

      // Insert right after original (common UX)
      const nextQuestions = [
        ...state.survey.questions.slice(0, idx + 1),
        copy,
        ...state.survey.questions.slice(idx + 1),
      ];

      const survey = touchSurvey({ ...state.survey, questions: nextQuestions });
      return markDirty({ ...state, survey, selectedQuestionId: copy.id, error: null });
    }

    case "MOVE_QUESTION": {
      const idx = findIndexById(state.survey.questions, action.payload.id);
      if (idx === -1) return state;

      const dir = action.payload.direction;
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= state.survey.questions.length) return state;

      const nextQuestions = [...state.survey.questions];
      const [item] = nextQuestions.splice(idx, 1);
      nextQuestions.splice(targetIdx, 0, item);

      const survey = touchSurvey({ ...state.survey, questions: nextQuestions });
      return markDirty({ ...state, survey, error: null });
    }

    case "SET_SAVE_STATUS": {
      return {
        ...state,
        saveStatus: action.payload.status,
        error: action.payload.error ?? (action.payload.status === "error" ? "Save failed." : null),
      };
    }

    case "CLEAR_ERROR": {
      return { ...state, error: null };
    }

    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function useSurveyBuilder(args?: InitArgs) {
  const initialSurvey = React.useMemo(() => args?.survey ?? createSurvey(), [args?.survey]);

  const [state, dispatch] = React.useReducer(reducer, {
    survey: initialSurvey,
    selectedQuestionId: initialSurvey.questions[0]?.id ?? null,
    saveStatus: "idle",
    error: null,
  });

  // If caller passes a new survey (e.g., loaded async), you can re-init
  React.useEffect(() => {
    if (args?.survey) {
      dispatch({ type: "INIT", payload: { survey: args.survey } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args?.survey?.id]);

  const selectedQuestion = React.useMemo(() => {
    if (!state.selectedQuestionId) return null;
    return state.survey.questions.find((q) => q.id === state.selectedQuestionId) ?? null;
  }, [state.selectedQuestionId, state.survey.questions]);

  // Actions
  const actions = React.useMemo(
    () => ({
      setTitle: (title: string) => dispatch({ type: "SET_TITLE", payload: { title } }),
      setDescription: (description: string) =>
        dispatch({ type: "SET_DESCRIPTION", payload: { description } }),

      selectQuestion: (id: QuestionId | null) =>
        dispatch({ type: "SELECT_QUESTION", payload: { id } }),

      addQuestion: (qType: QuestionType) =>
        dispatch({ type: "ADD_QUESTION", payload: { qType } }),

      updateQuestion: (id: QuestionId, patch: Partial<Question>) =>
        dispatch({ type: "UPDATE_QUESTION", payload: { id, patch } }),

      updateSelectedQuestion: (patch: Partial<Question>) => {
        if (!state.selectedQuestionId) return;
        dispatch({ type: "UPDATE_QUESTION", payload: { id: state.selectedQuestionId, patch } });
      },

      deleteQuestion: (id: QuestionId) => dispatch({ type: "DELETE_QUESTION", payload: { id } }),

      deleteSelectedQuestion: () => {
        if (!state.selectedQuestionId) return;
        dispatch({ type: "DELETE_QUESTION", payload: { id: state.selectedQuestionId } });
      },

      duplicateQuestion: (id: QuestionId) =>
        dispatch({ type: "DUPLICATE_QUESTION", payload: { id } }),

      duplicateSelectedQuestion: () => {
        if (!state.selectedQuestionId) return;
        dispatch({ type: "DUPLICATE_QUESTION", payload: { id: state.selectedQuestionId } });
      },

      moveQuestionUp: (id: QuestionId) =>
        dispatch({ type: "MOVE_QUESTION", payload: { id, direction: "up" } }),

      moveQuestionDown: (id: QuestionId) =>
        dispatch({ type: "MOVE_QUESTION", payload: { id, direction: "down" } }),

      setSaveStatus: (status: SaveStatus, error?: string | null) =>
        dispatch({ type: "SET_SAVE_STATUS", payload: { status, error } }),

      clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    }),
    [state.selectedQuestionId]
  );

  return {
    // state
    survey: state.survey,
    questions: state.survey.questions,
    selectedQuestionId: state.selectedQuestionId,
    selectedQuestion,
    saveStatus: state.saveStatus,
    isDirty: state.saveStatus === "dirty",
    error: state.error,

    // derived
    questionCount: state.survey.questions.length,
    canAddQuestion: state.survey.questions.length < MAX_QUESTIONS,

    // actions
    ...actions,
  };
}
