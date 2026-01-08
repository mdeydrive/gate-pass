
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
import { useMemo, useState } from "react";
import type { Activity } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { format }s from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default function DeliveriesPage() {
  const { activities, loading } = useGatePass();
  const [filter, setFilter] = useState('');

  const deliveryLog = useMemo(() => {
    if (loading) {
      return [];
    }
    const filtered = activities
        .filter(activity => 
            activity.passType === 'Delivery' && 
            (activity.visitorName.toLowerCase().includes(filter.toLowerCase()) || 
             activity.companyName?.toLowerCase().includes(filter.toLowerCase()))
        );

    return filtered
        .sort((a,b) => {
            const dateA = a.checkedInAt ? new Date(a.checkedInAt) : new Date(0);
            const dateB = b.checkedInAt ? new Date(b.checkedInAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
  }, [activities, loading, filter]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Delivery Log</CardTitle>
              <CardDescription>
                A log of all deliveries to the complex.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <Input
                placeholder="Search by name or company..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : deliveryLog.length > 0 ? (
            <div className="space-y-4">
                <div className="hidden md:grid grid-cols-6 gap-4 p-2 font-medium text-muted-foreground border-b">
                    <div className="col-span-2">Recipient / Visitor</div>
                    <div>Company</div>
                    <div>Check-in Time</div>
                    <div>Check-out Time</div>
                    <div className="text-right">Status</div>
                </div>
                 {deliveryLog.map(log => (
                    <div key={log.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                        <div className="col-span-2 flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={log.photo || `https://avatar.vercel.sh/${log.visitorName}.png`} alt={log.visitorName} />
                                <AvatarFallback>{log.visitorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{log.visitorName}</p>
                                <p className="text-sm text-muted-foreground">{log.mobileNumber}</p>
                                <div className="text-xs text-muted-foreground md:hidden mt-1">
                                    <p>Check-in: {formatTimestamp(log.checkedInAt)}</p>
                                    <p>Check-out: {formatTimestamp(log.checkedOutAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block text-sm">{log.companyName || 'N/A'}</div>

                        <div className="hidden md:block text-sm text-muted-foreground">
                            {formatTimestamp(log.checkedInAt)}
                        </div>
                        <div className="hidden md:block text-sm text-muted-foreground">
                           {formatTimestamp(log.checkedOutAt)}
                        </div>
                        
                        <div className="flex items-center justify-end md:justify-end text-right">
                           <Badge variant={getBadgeVariant(log.status)}>{log.status}</Badge>
                        </div>

                        <div className="col-span-2 border-t pt-4 flex md:hidden items-center justify-between text-sm">
                             <div className="text-muted-foreground">Company</div>
                             <div>{log.companyName || 'N/A'}</div>
                        </div>
                    </div>
                 ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No delivery activity found.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
