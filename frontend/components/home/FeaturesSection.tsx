import { Card } from "@/components/ui/Card";

export function FeaturesSection() {
  return (
    <section className="min-h-screen bg-soft-mint flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-navy">
            Everything you need for a full survey loop
          </h2>
          <p className="mt-3 text-navy/70 text-lg">
            Keep it simple: create, distribute, learn.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold">Create</h3>
            <p className="mt-2 text-gray-600">
              Build surveys with common question types and clean defaults.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Collect</h3>
            <p className="mt-2 text-gray-600">
              Share via link and start receiving responses immediately.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Analyze</h3>
            <p className="mt-2 text-gray-600">
              Spot trends quickly with summaries and exports.
            </p>
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap gap-6">
          <Stat label="to publish" value="2 min" />
          <Stat label="share links" value="Instant" />
          <Stat label="CSV-ready" value="Export" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/60 border border-white/70 px-6 py-4">
      <div className="text-3xl font-semibold text-navy">{value}</div>
      <div className="text-navy/70">{label}</div>
    </div>
  );
}
