import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCtaSection() {
  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-navy text-white px-8 py-12 md:px-12 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-semibold">
                Ready to launch your first survey?
              </h2>
              <p className="mt-3 text-white/70 text-lg">
                Start with a simple template and iterate from real responses.
              </p>
            </div>
            <Link href="/surveys/new">
              <Button>Create a survey</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
