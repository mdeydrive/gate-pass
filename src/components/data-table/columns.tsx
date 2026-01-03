"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Activity } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'secondary';
      case 'Pending': return 'destructive';
      default: return 'outline';
    }
};

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "visitorName",
    header: "ভিজিটর",
    cell: ({ row }) => {
        const activity = row.original
        return (
          <div className="font-medium">{activity.visitorName}</div>
        )
    }
  },
  {
    accessorKey: "passType",
    header: "পাসের প্রকার",
  },
  {
    accessorKey: "date",
    header: "তারিখ",
  },
  {
    accessorKey: "time",
    header: "সময়",
  },
  {
    accessorKey: "vehicle",
    header: "গাড়ির নম্বর",
    cell: ({ row }) => {
        return row.original.vehicle ? <span>{row.original.vehicle}</span> : <span className="text-muted-foreground">N/A</span>
    }
  },
  {
    accessorKey: "status",
    header: "স্ট্যাটাস",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getBadgeVariant(status)}>{status}</Badge>
    }
  },
]
