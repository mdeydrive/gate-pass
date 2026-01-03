import ActivityChart from "@/components/dashboard/activity-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import StatsCards from "@/components/dashboard/stats-cards";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityChart />
        <RecentActivity />
      </div>
    </div>
  );
}
