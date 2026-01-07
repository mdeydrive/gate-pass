'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AlertsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Activity Alerts</CardTitle>
        <CardDescription>
          AI-powered monitoring of entry and exit patterns to flag anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg bg-muted/50 min-h-[300px]">
          <div className="bg-primary/10 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Alerts Found</h3>
          <p className="text-muted-foreground max-w-sm">
            The AI monitoring system is active, but no suspicious activities have been detected at this time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
