
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

export default function HistoryPage() {
  const { activities } = useGatePass();

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
