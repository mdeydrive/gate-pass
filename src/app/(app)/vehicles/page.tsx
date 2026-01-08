'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useGatePass } from "@/contexts/gate-pass-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import type { Activity } from "@/lib/data";
import type { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type VehicleLogEntry = {
    id: string;
    vehicle?: string;
    visitorName: string;
    checkedInAt?: string;
    checkedOutAt?: string;
    status: Activity['status'];
};

const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'success';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
};

const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
        return format(new Date(timestamp), 'PPp');
    } catch (e) {
        return 'Invalid Date';
    }
}

export default function VehiclesPage() {
  const { activities, loading } = useGatePass();
  const [filter, setFilter] = useState('');

  const vehicleLog = useMemo(() => {
    if (loading) {
      return [];
    }
    const filtered = activities
        .filter(activity => activity.vehicle && activity.vehicle.toLowerCase().includes(filter.toLowerCase()));

    return filtered.map(activity => ({
            id: activity.id,
            vehicle: activity.vehicle,
            visitorName: activity.visitorName,
            checkedInAt: activity.checkedInAt,
            checkedOutAt: activity.checkedOutAt,
            status: activity.status,
        }))
        .sort((a,b) => {
            const dateA = a.checkedInAt ? new Date(a.checkedInAt) : new Date(0);
            const dateB = b.checkedInAt ? new Date(b.checkedInAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
  }, [activities, loading, filter]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Vehicle Log</CardTitle>
              <CardDescription>
                A log of all vehicles that have entered or exited the complex.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <Input
                placeholder="Search by vehicle number..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : vehicleLog.length > 0 ? (
            <div className="space-y-4">
                <div className="hidden md:grid grid-cols-5 gap-4 p-2 font-medium text-muted-foreground border-b">
                    <div>Vehicle Number</div>
                    <div>Associated Visitor</div>
                    <div>Check-in Time</div>
                    <div>Check-out Time</div>
                    <div>Status</div>
                </div>
                 {vehicleLog.map(log => (
                    <div key={log.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center p-4 border rounded-lg">
                        <div className="font-mono">{log.vehicle}</div>
                        <div className="text-sm">{log.visitorName}</div>
                        <div className="text-sm text-muted-foreground col-span-2 md:col-span-1">{formatTimestamp(log.checkedInAt)}</div>
                        <div className="text-sm text-muted-foreground col-span-2 md:col-span-1">{formatTimestamp(log.checkedOutAt)}</div>
                        <div><Badge variant={getBadgeVariant(log.status)}>{log.status}</Badge></div>
                    </div>
                 ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No vehicle activity found.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
