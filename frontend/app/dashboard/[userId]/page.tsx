"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDashboard, type DashboardSurvey } from "@/lib/dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SurveyGrid } from "@/components/dashboard/SurveyGrid";
import { SurveyCard } from "@/components/dashboard/SurveyCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { isAuthenticated } from "@/lib/auth";

export default function UserDashboardPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<DashboardSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    getUserDashboard()
      .then((res) => setSurveys(res.surveys))
      .finally(() => setLoading(false));
  }, [router]);

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
