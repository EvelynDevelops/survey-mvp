// frontend/components/survey-builder/BuilderShell.tsx

import * as React from "react";

type Props = {
  topBar?: React.ReactNode;

  /** Middle canvas (question list + cards) */
  canvas: React.ReactNode;

  /** Right settings panel */
  sidePanel: React.ReactNode;

  /**
   * If true, the side panel becomes a full-width section under canvas on small screens.
   * (Good default for MVP.)
   */
  stackOnMobile?: boolean;

  className?: string;
};

export function BuilderShell({
  topBar,
  canvas,
  sidePanel,
  stackOnMobile = true,
  className,
}: Props) {
  return (
    <div className={["min-h-[calc(100vh-64px)]", className].filter(Boolean).join(" ")}>
      {/* Sticky top bar region (optional) */}
      {topBar ? (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-7xl px-4 py-3">{topBar}</div>
        </div>
      ) : null}

      {/* Main two-column layout */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div
          className={[
            "grid gap-6",
            // Desktop: two columns
            "lg:grid-cols-[1fr_360px]",
            // Mobile behavior
            stackOnMobile ? "" : "grid-cols-[1fr_360px]",
          ].join(" ")}
        >
          <div className="min-w-0">{canvas}</div>

          <div className={stackOnMobile ? "lg:block" : ""}>
            {sidePanel}
          </div>
        </div>
      </div>
    </div>
  );
}
