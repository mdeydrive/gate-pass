

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

export default function HistoryPage() {
  const { activities, loading: loadingActivities } = useGatePass();
  const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
  const [loadingAuthorities, setLoadingAuthorities] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

    return activities.map(activity => {
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
    });
  }, [activities, authorities, loadingActivities, loadingAuthorities]);

  const loading = loadingActivities || loadingAuthorities;

  const passStatuses: Activity['status'][] = ['Checked In', 'Checked Out', 'Pending', 'Approved', 'Rejected'];

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
                        <SelectItem value="">All Statuses</SelectItem>
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={activitiesWithApprovers}
            filters={{
                visitorName: nameFilter,
                status: statusFilter
            }}
           />
        )}
      </CardContent>
    </Card>
  );
}
