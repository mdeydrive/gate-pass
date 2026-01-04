
'use client';

import { useRole } from '@/contexts/role-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

export default function DatabasePage() {
  const { role } = useRole();

  const handleBackup = () => {
    // Placeholder for backup logic
    alert('Backup functionality not yet implemented.');
  };

  const handleRestore = () => {
    // Placeholder for restore logic
    alert('Restore functionality not yet implemented.');
  };

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
              Please switch to an Admin role to access Database Management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Database Management</h1>
                <p className="text-muted-foreground">Backup and restore your application data.</p>
            </div>
        </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Backup Data</CardTitle>
            <CardDescription>
              Download a complete backup of all application data as a JSON file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup}>
              <Download className="mr-2 h-4 w-4" />
              Backup Database
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Restore Data</CardTitle>
            <CardDescription>
              Restore data from a previously downloaded JSON backup file. This will overwrite existing data.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={handleRestore} variant="destructive">
               <Upload className="mr-2 h-4 w-4" />
                Restore from Backup
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
                Warning: This action is irreversible.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
