import { api } from "@/lib/api";

export type DashboardSurvey = {
  id: string;
  title: string;
  status: "draft" | "published";
  slug: string | null;
  total_submissions: number;
  last_submitted_at: string | null;
};

export type UserDashboardResponse = {
  user_id: string;
  surveys: DashboardSurvey[];
};

export function getUserDashboard() {
  return api.get<UserDashboardResponse>("/dashboard");
}
