"use client";

import * as React from "react";

type Props = {
  title: string;
  onBack: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
};

export function PreviewTopBar({ title, onBack, onPublish, isPublishing }: Props) {
  return (
    <div className="sticky top-0 z-20 bg-navy">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            Preview
          </div>
          <div className="mt-2 text-lg font-semibold text-white truncate">{title}</div>
          <div className="text-xs text-white/70">Read-only preview — submission disabled</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Back
          </button>

          {onPublish ? (
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
