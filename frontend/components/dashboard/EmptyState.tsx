import Link from "next/link";

export function EmptyState() {
  return (
    <div className="rounded-2xl bg-white/70 p-10 text-center ring-1 ring-navy/5">
      <h3 className="text-lg font-semibold text-navy">
        No surveys yet
      </h3>
      <p className="mt-2 text-sm text-navy/60">
        Create your first survey to start collecting responses.
      </p>

      <Link
        href="/surveys/new"
        className="mt-6 inline-block rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint/90"
      >
        Create survey
      </Link>
    </div>
  );
}
