export function SocialProofSection() {
    return (
      <section className="min-h-screen bg-lavender flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left: Copy + Pills */}
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-navy">
                Make feedback effortless—for you and your audience
              </h2>
  
              <p className="mt-4 text-navy/70 text-lg max-w-xl">
                Thoughtful defaults, clean UI, and a survey flow people actually
                finish.
              </p>
  
              {/* Audience pills */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Pill>Product teams</Pill>
                <Pill>People &amp; Culture</Pill>
                <Pill>Customer Success</Pill>
              </div>
            </div>
  
            {/* Right: Testimonial */}
            <div className="rounded-3xl bg-white/80 border border-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-navy">
                What teams say
              </div>
  
              <p className="mt-4 text-navy text-lg leading-relaxed">
                “We went from guessing to knowing. Surveys are now part of how we
                ship better decisions—weekly.”
              </p>
  
              <div className="mt-6 text-navy/70 text-sm">
                — Product Lead, Acme Co.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  /* Local-only component */
  function Pill({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-full bg-white/70 border border-white px-4 py-2 text-sm font-medium text-navy">
        {children}
      </div>
    );
  }
  