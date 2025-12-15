"use client";

import { useEffect, useState } from "react";
import { getUserDashboard, type DashboardSurvey } from "@/lib/dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SurveyGrid } from "@/components/dashboard/SurveyGrid";
import { SurveyCard } from "@/components/dashboard/SurveyCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function UserDashboardPage() {
  const [surveys, setSurveys] = useState<DashboardSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserDashboard()
      .then((res) => setSurveys(res.surveys))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-lavender px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeader />

        {loading ? (
          <div className="text-sm text-navy/60">Loading dashboard…</div>
        ) : surveys.length === 0 ? (
          <EmptyState />
        ) : (
          <SurveyGrid>
            {surveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </SurveyGrid>
        )}
      </div>
    </div>
  );
}
