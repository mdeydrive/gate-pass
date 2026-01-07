
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>
          Generate and view reports for gate pass activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg bg-muted/50 min-h-[300px]">
            <h3 className="text-xl font-semibold">Reporting Feature Coming Soon</h3>
            <p className="text-muted-foreground max-w-sm">
                This section will allow you to generate detailed reports on visitor traffic, pass types, peak hours, and more.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
