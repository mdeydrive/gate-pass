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
      case 'Checked Out': return 'secondary';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      case 'Rejected': 'destructive';
      default: return 'outline';
    }
};

const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
        return format(new Date(timestamp), 'PPpp');
    } catch (e) {
        return 'Invalid Date';
    }
}

const vehicleColumns: ColumnDef<VehicleLogEntry>[] = [
    {
      accessorKey: "vehicle",
      header: "Vehicle Number",
      cell: ({ row }) => <div className="font-mono">{row.original.vehicle}</div>
    },
    {
      accessorKey: "visitorName",
      header: "Associated Visitor",
    },
    {
      accessorKey: "checkedInAt",
      header: "Check-in Time",
      cell: ({ row }) => formatTimestamp(row.original.checkedInAt)
    },
    {
      accessorKey: "checkedOutAt",
      header: "Check-out Time",
      cell: ({ row }) => formatTimestamp(row.original.checkedOutAt)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getBadgeVariant(status)}>{status}</Badge>
      }
    },
];

export default function VehiclesPage() {
  const { activities, loading } = useGatePass();
  const [filter, setFilter] = useState('');

  const vehicleLog = useMemo(() => {
    if (loading) {
      return [];
    }
    return activities
        .filter(activity => activity.vehicle)
        .map(activity => ({
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
  }, [activities, loading]);

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
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable 
              columns={vehicleColumns} 
              data={vehicleLog} 
              filterColumn="vehicle" 
              filterValue={filter}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
