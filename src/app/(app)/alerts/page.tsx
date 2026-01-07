
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Clock, Repeat, User } from 'lucide-react';
import { useGatePass } from '@/contexts/gate-pass-context';
import { useEffect, useMemo, useState } from 'react';
import type { Activity } from '@/lib/data';
import { differenceInHours, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Alert = {
  activity: Activity;
  reason: 'Long Stay' | 'Frequent Visits' | 'Unusual Hours';
  details: string;
};

const LONG_STAY_HOURS = 2; // More than 2 hours for delivery/vendor is suspicious
const FREQUENT_VISITS_COUNT = 3; // 3 or more visits in a day is suspicious
const UNUSUAL_HOURS_START = 0; // 12 AM
const UNUSUAL_HOURS_END = 6; // 6 AM

export default function AlertsPage() {
  const { activities, loading } = useGatePass();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!activities || activities.length === 0) {
      setAlerts([]);
      return;
    }

    const generatedAlerts: Alert[] = [];

    // Rule 1: Long Stay for Delivery/Vendors
    activities
      .filter(a => a.status === 'Checked In' && (a.passType === 'Delivery' || a.passType === 'Vendor') && a.checkedInAt)
      .forEach(a => {
        const hours = differenceInHours(new Date(), parseISO(a.checkedInAt!));
        if (hours >= LONG_STAY_HOURS) {
          generatedAlerts.push({
            activity: a,
            reason: 'Long Stay',
            details: `${a.passType} has been checked in for over ${hours} hours.`,
          });
        }
      });

    // Rule 2: Frequent Visits on the same day
    const visitorVisitCount = new Map<string, number>();
    const today = new Date().toISOString().split('T')[0];
    activities
      .filter(a => a.date === today && a.passType === 'Guest' && a.mobileNumber)
      .forEach(a => {
        const count = visitorVisitCount.get(a.mobileNumber!) || 0;
        visitorVisitCount.set(a.mobileNumber!, count + 1);
      });

    visitorVisitCount.forEach((count, mobileNumber) => {
      if (count >= FREQUENT_VISITS_COUNT) {
        const lastVisit = activities.find(a => a.mobileNumber === mobileNumber && a.date === today);
        if (lastVisit) {
          generatedAlerts.push({
            activity: lastVisit,
            reason: 'Frequent Visits',
            details: `Visitor has entered ${count} times today.`,
          });
        }
      }
    });

     // Rule 3: Unusual Hours check-in
     activities
     .filter(a => a.status === 'Checked In' && a.checkedInAt)
     .forEach(a => {
         const checkInHour = parseISO(a.checkedInAt!).getHours();
         if (checkInHour >= UNUSUAL_HOURS_START && checkInHour < UNUSUAL_HOURS_END) {
             generatedAlerts.push({
                 activity: a,
                 reason: 'Unusual Hours',
                 details: `Visitor checked in at an unusual time: ${new Date(a.checkedInAt!).toLocaleTimeString()}`,
             });
         }
     });

    // Deduplicate alerts based on activity ID and reason
    const uniqueAlerts = Array.from(new Map(generatedAlerts.map(a => [`${a.activity.id}-${a.reason}`, a])).values());

    setAlerts(uniqueAlerts);

  }, [activities]);

  const getReasonIcon = (reason: Alert['reason']) => {
    switch (reason) {
      case 'Long Stay':
        return <Clock className="h-5 w-5" />;
      case 'Frequent Visits':
        return <Repeat className="h-5 w-5" />;
      case 'Unusual Hours':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Activity Alerts</CardTitle>
        <CardDescription>
          AI-powered monitoring of entry and exit patterns to flag anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
        ) : alerts.length > 0 ? (
          <div className="grid gap-4">
            {alerts.map((alert, index) => (
              <Card key={`${alert.activity.id}-${index}`} className="p-4">
                 <div className="flex items-start gap-4">
                    <div className="bg-destructive/10 text-destructive p-3 rounded-full">
                        {getReasonIcon(alert.reason)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{alert.activity.visitorName}</CardTitle>
                            <Badge variant="destructive">{alert.reason}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.details}</p>
                        <div className="text-xs text-muted-foreground mt-2 space-x-4">
                            <span><User className="inline-block h-3 w-3 mr-1" />{alert.activity.passType}</span>
                            <span><Clock className="inline-block h-3 w-3 mr-1" />{alert.activity.date} at {alert.activity.time}</span>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm">View Details</Button>
                 </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg bg-muted/50 min-h-[300px]">
            <div className="bg-primary/10 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Alerts Found</h3>
            <p className="text-muted-foreground max-w-sm">
              The AI monitoring system is active, but no suspicious activities have been detected at this time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
