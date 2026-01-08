
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PrintPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Center</CardTitle>
        <CardDescription>
          Generate and print gate passes or reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg bg-muted/50 min-h-[300px]">
            <h3 className="text-xl font-semibold">Printing Feature Coming Soon</h3>
            <p className="text-muted-foreground max-w-sm">
                This section will allow you to print gate passes, visitor logs, and detailed activity reports.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
