
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { activities } from "@/lib/data";
import initialActivities from '@/data/gate-pass-data.json';
import { type Activity } from "@/lib/data";

export default function HistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor History</CardTitle>
        <CardDescription>
          A complete log of all gate activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={initialActivities as Activity[]} />
      </CardContent>
    </Card>
  );
}
