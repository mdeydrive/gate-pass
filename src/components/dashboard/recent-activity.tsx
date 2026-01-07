
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/lib/data";
import { useGatePass } from "@/contexts/gate-pass-context";
import { Skeleton } from "../ui/skeleton";

export default function RecentActivity() {
  const { activities, loading } = useGatePass();
  const recentActivities = activities.slice(0, 5);

  const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'success';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of the latest entries and exits.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center h-10">
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="font-medium">{activity.visitorName}</div>
                  <div className="text-sm text-muted-foreground">{activity.passType} at {activity.time}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                        No recent activity found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
