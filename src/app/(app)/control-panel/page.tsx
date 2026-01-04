
'use client';

import { useRole } from '@/contexts/role-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function ControlPanelPage() {
  const { role } = useRole();

  if (role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please switch to an Admin role to access the Control Panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company name and details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" />
            </div>
            <Button>Save Information</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Logo</CardTitle>
            <CardDescription>
              Upload or change your company logo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Logo Preview</p>
            </div>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Upload Logo
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Print Settings</CardTitle>
          <CardDescription>
            Configure how gate passes are printed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Print setting options will be available here.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage other application-wide settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            General application settings will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
