
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
      accessorKey: "id",
      header: "Gate Pass ID",
    },
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

const getBadgeVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Checked In': return 'default';
      case 'Checked Out': return 'success';
      case 'Pending': return 'destructive';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
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


export default function VisitorsPage() {
  const { activities, loading } = useGatePass();
  const [filter, setFilter] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<UniqueVisitor | null>(null);

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

  const selectedVisitorHistory = useMemo(() => {
    if (!selectedVisitor || !selectedVisitor.mobileNumber) return [];
    return activities.filter(activity => activity.mobileNumber === selectedVisitor.mobileNumber)
      .sort((a,b) => {
          const dateA = a.checkedInAt ? new Date(a.checkedInAt) : new Date(a.date);
          const dateB = b.checkedInAt ? new Date(b.checkedInAt) : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
      });
  }, [selectedVisitor, activities]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Visitor List</CardTitle>
              <CardDescription>
                A list of all unique visitors who have previously entered the complex. Click a row for details.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <Input
                placeholder="Search by visitor name..."
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
              columns={visitorColumns} 
              data={uniqueVisitors} 
              filterColumn="visitorName" 
              filterValue={filter}
              onRowClick={(row) => setSelectedVisitor(row.original)}
            />
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedVisitor} onOpenChange={(open) => !open && setSelectedVisitor(null)}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Visit History for {selectedVisitor?.visitorName}</DialogTitle>
            <DialogDescription>
              Showing all recorded gate passes for {selectedVisitor?.mobileNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Gate Pass ID</TableHead>
                        <TableHead>Pass Type</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Check-out Time</TableHead>
                        <TableHead>Vehicle No.</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedVisitorHistory.length > 0 ? selectedVisitorHistory.map(activity => (
                        <TableRow key={activity.id}>
                            <TableCell className="font-mono text-xs">{activity.id}</TableCell>
                            <TableCell>{activity.passType}</TableCell>
                            <TableCell>{formatTimestamp(activity.checkedInAt)}</TableCell>
                            <TableCell>{formatTimestamp(activity.checkedOutAt)}</TableCell>
                             <TableCell>{activity.vehicle || "N/A"}</TableCell>
                            <TableCell>
                                <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">No history found for this visitor.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
