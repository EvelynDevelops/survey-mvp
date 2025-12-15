"use client";

import * as React from "react";

type Props = {
  open: boolean;
  publicLink: string;
  onClose: () => void;
  onGoDashboard: () => void;
};

export function PublishSuccessModal({ open, publicLink, onClose, onGoDashboard }: Props) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = publicLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/30 bg-white shadow-xl">
        <div className="p-6 sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-soft_mint px-3 py-1 text-xs font-semibold text-navy">
            Published
          </div>

          <h2 className="mt-4 text-2xl font-bold text-navy">
            Your survey is live
          </h2>
          <p className="mt-2 text-slate-600">
            Share this link with respondents. You can view results in the dashboard.
          </p>

          {/* Link row */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600">Public link</div>

            <div className="mt-2 flex items-center gap-2">
              <a
                href={publicLink}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-2 text-sm text-slate-800 border border-slate-200 hover:bg-slate-50"
                title={publicLink}
              >
                {publicLink}
              </a>

              <button
                onClick={copy}
                className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                title="Copy link"
                aria-label="Copy link"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={onGoDashboard}
              className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
