
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VideoConferencePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Conference</CardTitle>
        <CardDescription>
          Join or start a video conference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg bg-muted/50 min-h-[300px]">
            <h3 className="text-xl font-semibold">Video Conferencing Coming Soon</h3>
            <p className="text-muted-foreground max-w-sm">
                This section will allow you to start and join video meetings.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
