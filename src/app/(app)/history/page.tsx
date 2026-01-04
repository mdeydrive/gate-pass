
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
import initialActivities from '@/data/gate-pass-data.json';
import { type Activity } from "@/lib/data";
import { useState } from "react";

export default function HistoryPage() {
  // In a real application, this data would be fetched from a database.
  // For now, we'll keep it in local state for demonstration on the history page.
  // The gate-pass page will manage its own state.
  const [activities] = useState<Activity[]>(initialActivities as Activity[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor History</CardTitle>
        <CardDescription>
          A complete log of all gate activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={activities} />
      </CardContent>
    </Card>
  );
}
