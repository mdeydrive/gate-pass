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
import { useMemo } from "react";
import type { Activity } from "@/lib/data";
import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UniqueVisitor = {
    id: string;
    visitorName: string;
    mobileNumber?: string;
    companyName?: string;
    lastVisit: string;
    photo?: string;
};

const visitorColumns: ColumnDef<UniqueVisitor>[] = [
    {
      accessorKey: "visitorName",
      header: "Visitor",
      cell: ({ row }) => {
          const visitor = row.original
          return (
            <div className="flex items-center gap-3">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src={visitor.photo || `https://avatar.vercel.sh/${visitor.visitorName}.png`} alt="Avatar" />
                  <AvatarFallback>{visitor.visitorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{visitor.visitorName}</div>
            </div>
          )
      }
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile No.",
    },
    {
      accessorKey: "companyName",
      header: "Company",
       cell: ({ row }) => {
        return row.original.companyName ? <span>{row.original.companyName}</span> : <span className="text-muted-foreground">N/A</span>
    }
    },
    {
      accessorKey: "lastVisit",
      header: "Last Visit",
    },
];


export default function VisitorsPage() {
  const { activities, loading } = useGatePass();

  const uniqueVisitors = useMemo(() => {
    if (loading) {
      return [];
    }

    const visitorsMap = new Map<string, UniqueVisitor>();

    activities.forEach(activity => {
        if (!activity.mobileNumber) return; // Skip activities without a mobile number

        const existingVisitor = visitorsMap.get(activity.mobileNumber);
        const visitDate = new Date(activity.date);

        if (!existingVisitor || new Date(existingVisitor.lastVisit) < visitDate) {
            visitorsMap.set(activity.mobileNumber, {
                id: activity.id,
                visitorName: activity.visitorName,
                mobileNumber: activity.mobileNumber,
                companyName: activity.companyName,
                lastVisit: activity.date,
                photo: activity.photo,
            });
        }
    });

    return Array.from(visitorsMap.values()).sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [activities, loading]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor List</CardTitle>
        <CardDescription>
          A list of all unique visitors who have previously entered the complex.
        </CardDescription>
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
          <DataTable columns={visitorColumns} data={uniqueVisitors} />
        )}
      </CardContent>
    </Card>
  );
}
