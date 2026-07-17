import { redirect } from "next/navigation";

import { enterDashboardAction } from "@/core/actions/context-actions";
import { requireSessionUserId } from "@/core/auth/session";

export default async function EnterDashboardPage() {
  await requireSessionUserId();
  await enterDashboardAction();
  redirect("/dashboard");
}
