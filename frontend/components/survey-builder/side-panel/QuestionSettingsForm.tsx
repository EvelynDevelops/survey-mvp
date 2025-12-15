// frontend/components/survey-builder/side-panel/QuestionSettingsForm.tsx

"use client";

import * as React from "react";
import type { ChoiceOption, Question } from "@/lib/survey-builder/types";

type Props = {
  question: Question;
  onChange: (patch: Partial<Question>) => void;

  onDelete: () => void;
  onDuplicate: () => void;
};

export function QuestionSettingsForm({ question, onChange, onDelete, onDuplicate }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Editing</div>
          <div className="text-sm font-semibold text-slate-900">
            {labelForType(question.type)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Basics */}
      <Section title="Question">
        <Field label="Title">
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={question.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Type your question…"
          />
        </Field>

        <Field label="Description (optional)">
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            rows={3}
            value={question.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Add additional context…"
          />
        </Field>

        <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={question.required}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          Required
        </label>
      </Section>

      {/* Type-specific */}
      {question.type === "single" || question.type === "multiple" ? (
        <ChoiceOptionsEditor question={question} onChange={onChange} />
      ) : null}

      {question.type === "text" ? (
        <TextSettingsEditor question={question} onChange={onChange} />
      ) : null}

      {question.type === "image" ? (
        <ImageUploadSettingsEditor question={question} onChange={onChange} />
      ) : null}
    </div>
  );
}

/* ----------------------------- Choice editor ----------------------------- */

function ChoiceOptionsEditor({
  question,
  onChange,
}: {
  question: Extract<Question, { type: "single" | "multiple" }>;
  onChange: (patch: Partial<Question>) => void;
}) {
  const options = question.options ?? [];

  const updateOptionLabel = (id: string, label: string) => {
    const next = options.map((o) => (o.id === id ? { ...o, label } : o));
    onChange({ options: next } as Partial<Question>);
  };

  const addOption = () => {
    const next: ChoiceOption[] = [
      ...options,
      { id: `o_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`, label: `Option ${options.length + 1}` },
    ];
    onChange({ options: next } as Partial<Question>);
  };

  const removeOption = (id: string) => {
    const next = options.filter((o) => o.id !== id);
    onChange({ options: next } as Partial<Question>);
  };

  const tooFew = options.length < 2;

  return (
    <Section title="Options">
      <div className="space-y-3">
        {options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-6">{idx + 1}.</span>
            <input
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={opt.label}
              onChange={(e) => updateOptionLabel(opt.id, e.target.value)}
            />
            <button
              type="button"
              className="rounded-md border px-2 py-2 text-sm hover:bg-slate-50 disabled:opacity-40"
              disabled={options.length <= 2}
              onClick={() => removeOption(opt.id)}
              title={options.length <= 2 ? "Keep at least 2 options" : "Remove option"}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {tooFew ? (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          Add at least 2 options.
        </div>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={addOption}
          className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
        >
          + Add option
        </button>
      </div>
    </Section>
  );
}

/* ------------------------------ Text editor ------------------------------ */

function TextSettingsEditor({
  question,
  onChange,
}: {
  question: Extract<Question, { type: "text" }>;
  onChange: (patch: Partial<Question>) => void;
}) {
  return (
    <Section title="Text settings">
      <Field label="Placeholder (optional)">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          value={question.placeholder ?? ""}
          onChange={(e) => onChange({ placeholder: e.target.value } as Partial<Question>)}
          placeholder="Type your answer here…"
        />
      </Field>

      <div className="text-xs text-slate-500">
        (Optional) Add min/max length constraints later.
      </div>
    </Section>
  );
}

/* --------------------------- Image upload editor -------------------------- */

function ImageUploadSettingsEditor({
  question,
  onChange,
}: {
  question: Extract<Question, { type: "image" }>;
  onChange: (patch: Partial<Question>) => void;
}) {
  const accept = question.upload.accept.join(", ");
  const maxMB = Math.max(1, Math.round(question.upload.maxSizeBytes / (1024 * 1024)));
  const maxFiles = question.upload.maxFiles;

  return (
    <Section title="Upload settings">
      <Field label="Accepted types (comma separated)">
        <input
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          value={accept}
          onChange={(e) =>
            onChange({
              upload: {
                ...question.upload,
                accept: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            } as Partial<Question>)
          }
          placeholder="image/png, image/jpeg"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Max size (MB)">
          <input
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={maxMB}
            onChange={(e) => {
              const mb = Number(e.target.value || 1);
              onChange({
                upload: {
                  ...question.upload,
                  maxSizeBytes: Math.max(1, mb) * 1024 * 1024,
                },
              } as Partial<Question>);
            }}
          />
        </Field>

        <Field label="Max files">
          <input
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={maxFiles}
            onChange={(e) => {
              const n = Number(e.target.value || 1);
              onChange({
                upload: {
                  ...question.upload,
                  maxFiles: Math.max(1, n),
                },
              } as Partial<Question>);
            }}
          />
        </Field>
      </div>

      <div className="text-xs text-slate-500">
        Tip: for MVP you can keep max files = 1 and size = 5MB.
      </div>
    </Section>
  );
}

/* --------------------------------- UI bits -------------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function labelForType(type: Question["type"]) {
  switch (type) {
    case "single":
      return "Single choice";
    case "multiple":
      return "Multiple choice";
    case "text":
      return "Text";
    case "image":
      return "Image upload";
    default:
      return type;
  }
}
