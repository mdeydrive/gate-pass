
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Activity } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    header: "Visitor",
    cell: ({ row }) => {
        const activity = row.original
        return (
          <div className="flex items-center gap-3">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={activity.photo || `https://avatar.vercel.sh/${activity.visitorName}.png`} alt="Avatar" />
                <AvatarFallback>{activity.visitorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{activity.visitorName}</div>
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
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
        return row.original.location ? <span>{row.original.location}</span> : <span className="text-muted-foreground">N/A</span>
    }
  },
  {
    accessorKey: "passType",
    header: "Pass Type",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "vehicle",
    header: "Vehicle No",
    cell: ({ row }) => {
        return row.original.vehicle ? <span>{row.original.vehicle}</span> : <span className="text-muted-foreground">N/A</span>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getBadgeVariant(status)}>{status}</Badge>
    }
  },
]
