export function SubmitBar({
    disabled,
    submitting,
    onSubmit,
  }: {
    disabled: boolean;
    submitting: boolean;
    onSubmit: () => void;
  }) {
    return (
      <div className="flex items-center justify-end">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="rounded-xl bg-mint px-6 py-3 text-sm font-semibold text-white hover:bg-mint/90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    );
  }
  