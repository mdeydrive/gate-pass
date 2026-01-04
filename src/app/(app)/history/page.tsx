
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { useGatePass } from "@/contexts/gate-pass-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { activities, loading } = useGatePass();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor History</CardTitle>
        <CardDescription>
          A complete log of all gate activities.
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
          <DataTable columns={columns} data={activities} />
        )}
      </CardContent>
    </Card>
  );
}
