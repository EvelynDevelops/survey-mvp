'use client';

import Link from "next/link";
import { useState } from "react";
import { DashboardSurvey } from "@/lib/dashboard";

function formatTime(ts: string | null) {
  if (!ts) return "No submissions yet";
  return new Date(ts).toLocaleString();
}

export function SurveyCard({ survey }: { survey: DashboardSurvey }) {
  const isPublished = survey.status === "published";
  const [copied, setCopied] = useState(false);

  // Get full public URL
  const publicUrl = survey.slug
    ? `${window.location.origin}/public/surveys/${survey.slug}`
    : null;

  const handleCopyLink = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-navy/5 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-navy">
          {survey.title}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isPublished
              ? "bg-mint/15 text-mint"
              : "bg-amber/15 text-amber"
          }`}
        >
          {survey.status}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-5 space-y-2">
        <div className="text-3xl font-semibold text-navy">
          {survey.total_submissions}
        </div>
        <div className="text-sm text-navy/60">
          submissions
        </div>
        <div className="text-xs text-navy/50">
          Last submitted: {formatTime(survey.last_submitted_at)}
        </div>
      </div>

      {/* Public link with copy button */}
      {isPublished && publicUrl && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg bg-lavender px-3 py-2 text-xs text-navy">
            {publicUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 rounded-lg bg-mint px-3 py-2 text-xs font-medium text-white hover:bg-mint/90 transition-colors"
            title="Copy link"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        {isPublished && survey.slug ? (
          <>
            <Link
              href={`/public/surveys/${survey.slug}`}
              target="_blank"
              className="text-sm font-medium text-mint hover:underline inline-flex items-center gap-1"
            >
              View survey
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <Link
              href={`/surveys/${survey.id}/responses`}
              className="text-sm font-medium text-navy/70 hover:underline"
            >
              View responses
            </Link>
          </>
        ) : (
          <Link
            href={`/surveys/${survey.id}`}
            className="text-sm font-medium text-mint hover:underline"
          >
            Continue editing
          </Link>
        )}
      </div>
    </div>
  );
}
