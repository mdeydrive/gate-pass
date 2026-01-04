
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Activity } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'secondary';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
};

export const columns: ColumnDef<Activity & { approverNames?: string[] }>[] = [
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
    accessorKey: "approverNames",
    header: "Approving Authority",
    cell: ({ row }) => {
        const approverNames = row.original.approverNames;
        return approverNames && approverNames.length > 0 ? (
            <div className="flex flex-col">
                {approverNames.map((name, index) => (
                    <span key={index}>{name}</span>
                ))}
            </div>
        ) : (
            <span className="text-muted-foreground">N/A</span>
        );
    }
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
        const status = row.getValue("status") as Activity['status'];
        return <Badge variant={getBadgeVariant(status)}>{status}</Badge>
    }
  },
]
