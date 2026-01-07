
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Car, CheckCircle, Hourglass } from "lucide-react";
import { useGatePass } from "@/contexts/gate-pass-context";
import { useMemo } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, description, loading }: { title: string, value: number | string, icon: React.ElementType, description?: string, loading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-1/2" />
                        {description && <Skeleton className="h-4 w-3/4 mt-1" />}
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </>
                )}
            </CardContent>
        </Card>
    );
}


export default function StatsCards() {
    const { activities, loading } = useGatePass();

    const stats = useMemo(() => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayActivities = activities.filter(a => a.date === todayStr);

        const totalVisitorsToday = new Set(todayActivities.map(a => a.mobileNumber)).size;
        const checkedIn = activities.filter(a => a.status === 'Checked In').length;
        const pendingApproval = activities.filter(a => a.status === 'Pending').length;
        const vehiclesInside = activities.filter(a => a.status === 'Checked In' && a.vehicle).length;

        return { totalVisitorsToday, checkedIn, pendingApproval, vehiclesInside };
    }, [activities]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
            title="Total Visitors Today"
            value={stats.totalVisitorsToday}
            icon={Users}
            description="Unique visitors today"
            loading={loading}
        />
        <StatCard
            title="Checked In"
            value={stats.checkedIn}
            icon={CheckCircle}
            description="Currently inside the complex"
            loading={loading}
        />
        <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            icon={Hourglass}
            description="Awaiting resident confirmation"
            loading={loading}
        />
        <StatCard
            title="Vehicles Inside"
            value={stats.vehiclesInside}
            icon={Car}
            description="Across all parking areas"
            loading={loading}
        />
    </div>
  );
}
