import Link from "next/link";

export function DashboardHeader() {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Manage your surveys and responses
        </p>
      </div>

      <Link
        href="/surveys/new"
        className="rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint/90"
      >
        Create survey
      </Link>
    </div>
  );
}
