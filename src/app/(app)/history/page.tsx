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

export default function HistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ভিজিটর হিস্ট্রি</CardTitle>
        <CardDescription>
          সমস্ত গেট কার্যক্রমের একটি সম্পূর্ণ লগ।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={activities} />
      </CardContent>
    </Card>
  );
}
