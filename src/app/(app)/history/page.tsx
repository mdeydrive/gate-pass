

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

export default function HistoryPage() {
  const { activities, loading: loadingActivities } = useGatePass();
  const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
  const [loadingAuthorities, setLoadingAuthorities] = useState(true);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor History</CardTitle>
        <CardDescription>
          A complete log of all gate activities.
        </CardDescription>
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
          <DataTable columns={columns} data={activitiesWithApprovers} />
        )}
      </CardContent>
    </Card>
  );
}
