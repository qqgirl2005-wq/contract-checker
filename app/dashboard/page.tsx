import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "我的合約 | AI 合約審查器" };

export default function DashboardPage() {
  return <Dashboard />;
}
