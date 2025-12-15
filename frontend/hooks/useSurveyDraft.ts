"use client";

import * as React from "react";
import type { Survey } from "@/lib/survey-builder/types";

type UseSurveyDraftOptions = {
  storageKey?: string;
};

export function useSurveyDraft(options?: UseSurveyDraftOptions) {
  const storageKey = options?.storageKey ?? "surveyBuilderDraft";
  const [survey, setSurvey] = React.useState<Survey | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const load = React.useCallback(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        setSurvey(null);
      } else {
        setSurvey(JSON.parse(raw) as Survey);
      }
    } catch {
      setSurvey(null);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  const save = React.useCallback(
    (next: Survey) => {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      setSurvey(next);
    },
    [storageKey]
  );

  const clear = React.useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setSurvey(null);
  }, [storageKey]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    storageKey,
    survey,
    isLoaded,
    load,
    save,
    clear,
  };
}
