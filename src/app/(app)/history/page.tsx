

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGatePass } from "@/contexts/gate-pass-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import type { ApprovingAuthority, Activity } from "@/lib/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
        return format(new Date(timestamp), 'PPp');
    } catch (e) {
        return 'Invalid Date';
    }
}


export default function HistoryPage() {
  const { activities, loading: loadingActivities } = useGatePass();
  const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
  const [loadingAuthorities, setLoadingAuthorities] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchAuthorities() {
      try {
        setLoadingAuthorities(true);
        const response = await fetch('/api/authorities');
        if (!response.ok) throw new Error("Failed to fetch authorities.");
        const data = await response.json();
        setAuthorities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAuthorities(false);
      }
    }
    fetchAuthorities();
  }, []);

  const activitiesWithApprovers = useMemo(() => {
    if (loadingActivities || loadingAuthorities) {
      return [];
    }
    
    const authorityMap = new Map(authorities.map(auth => [auth.id, auth.name]));

    return activities
    .map(activity => {
      let approverNames: string[] = [];
      if (activity.approvedById) {
        const name = authorityMap.get(activity.approvedById);
        if (name) approverNames.push(name);
      }
      else if (activity.approverIds && activity.approverIds.length > 0) {
           activity.approverIds.forEach(id => {
               const name = authorityMap.get(id);
               if (name) approverNames.push(name);
           })
      }

      return {
        ...activity,
        approverNames: approverNames.length > 0 ? approverNames : undefined,
      };
    })
    .filter(activity => {
        const nameMatch = activity.visitorName.toLowerCase().includes(nameFilter.toLowerCase());
        const statusMatch = statusFilter === 'all' || activity.status === statusFilter;
        return nameMatch && statusMatch;
    });
  }, [activities, authorities, loadingActivities, loadingAuthorities, nameFilter, statusFilter]);

  const loading = loadingActivities || loadingAuthorities;

  const passStatuses: Activity['status'][] = ['Checked In', 'Checked Out', 'Pending', 'Approved', 'Rejected'];

  const getApproverDisplay = (activity: Activity & { approverNames?: string[] }) => {
     let approverDisplay: string[] | undefined;

        if (activity.status === 'Approved' || activity.status === 'Rejected') {
            const approverName = activity.approverNames?.find(name => name); // Get first defined name
            if (approverName) {
                approverDisplay = [approverName];
            }
        } else if (activity.status === 'Pending' && activity.approverNames && activity.approverNames.length > 0) {
            approverDisplay = activity.approverNames;
        }

        return approverDisplay && approverDisplay.length > 0 ? (
            <div className="flex flex-col">
                {approverDisplay.map((name, index) => (
                    <span key={index}>{name}</span>
                ))}
            </div>
        ) : (
            <span className="text-muted-foreground">N/A</span>
        );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Visitor History</CardTitle>
                <CardDescription>
                A complete log of all gate activities.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:max-w-md gap-2">
                <Input
                    placeholder="Search by visitor name..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full sm:w-auto"
                />
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {passStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
           <div className="space-y-4">
                 <div className="hidden md:grid grid-cols-6 gap-4 p-2 font-medium text-muted-foreground border-b">
                    <div className="col-span-2">Visitor</div>
                    <div>Check-in</div>
                    <div>Check-out</div>
                    <div>Approver</div>
                    <div className="text-right">Status</div>
                </div>

                {activitiesWithApprovers.length > 0 ? activitiesWithApprovers.map((activity) => (
                    <div key={activity.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                        <div className="col-span-2 flex items-center gap-3">
                             <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={activity.photo || `https://avatar.vercel.sh/${activity.visitorName}.png`} alt="Avatar" />
                                <AvatarFallback>{activity.visitorName.charAt(0)}</AvatarFallback>
                             </Avatar>
                            <div>
                                <p className="font-medium">{activity.visitorName}</p>
                                <p className="text-sm text-muted-foreground">{activity.mobileNumber}</p>
                                <div className="text-xs text-muted-foreground md:hidden mt-1">
                                    <p>Check-in: {formatTimestamp(activity.checkedInAt)}</p>
                                    <p>Check-out: {formatTimestamp(activity.checkedOutAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block text-sm text-muted-foreground">
                            {formatTimestamp(activity.checkedInAt)}
                        </div>
                        <div className="hidden md:block text-sm text-muted-foreground">
                            {formatTimestamp(activity.checkedOutAt)}
                        </div>

                        <div className="hidden md:block text-sm">
                           {getApproverDisplay(activity)}
                        </div>
                        
                        <div className="flex items-center justify-end md:justify-end text-right">
                           <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                        </div>

                         <div className="col-span-2 border-t pt-4 flex md:hidden items-center justify-between text-sm">
                             <div className="text-muted-foreground">Approver</div>
                             <div>{getApproverDisplay(activity)}</div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center col-span-full py-12 text-muted-foreground">
                        No history found matching your criteria.
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
