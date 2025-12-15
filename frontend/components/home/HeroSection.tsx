import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="min-h-screen bg-navy text-white flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Left: Copy */}
          <div>
            <div className="text-mint font-semibold tracking-wide">
              Create. Share. Improve.
            </div>

            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
              Surveys that turn feedback into action.
            </h1>

            <p className="mt-5 text-white/70 text-lg md:text-xl max-w-xl">
              Build surveys fast, collect responses instantly, and understand what to do next.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/surveys/new">
                <Button>Get started</Button>
              </Link>
              <Link href="/surveys">
                <Button variant="secondary">View surveys</Button>
              </Link>
            </div>
          </div>

          {/* Right: Survey Preview */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="text-sm text-white/60 mb-4">
              Survey preview
            </div>

            <div className="space-y-5 text-white/70">
              {/* Survey title */}
              <div>
                <div className="text-xs text-white/50 mb-1">
                  Survey title
                </div>
                <div className="h-10 rounded-xl bg-white/10 flex items-center px-4 text-sm">
                  Product feedback survey
                </div>
              </div>

              {/* Question */}
              <div>
                <div className="text-xs text-white/50 mb-1">
                  Question
                </div>
                <div className="h-24 rounded-2xl bg-white/10 flex items-center px-4 text-sm leading-snug">
                  How satisfied are you with your experience so far?
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 rounded-xl bg-white/10 flex items-center px-4 text-sm">
                  Very satisfied
                </div>
                <div className="h-10 rounded-xl bg-white/10 flex items-center px-4 text-sm">
                  Needs improvement
                </div>
              </div>

              {/* Submit */}
              <div className="h-12 rounded-2xl bg-mint/40 flex items-center justify-center text-sm text-navy font-semibold">
                Submit
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
