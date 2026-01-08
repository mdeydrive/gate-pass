
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
import { useCompany } from '@/contexts/company-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';

export default function SettingsPage() {
  const { role } = useRole();
  const { companyName, setCompanyName, logoUrl, setLogoUrl } = useCompany();
  const { toast } = useToast();
  const [currentName, setCurrentName] = useState(companyName);
  const [currentLogo, setCurrentLogo] = useState(logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveInfo = async () => {
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: currentName }),
      });
      if (!response.ok) throw new Error('Failed to save company name');
      setCompanyName(currentName);
      toast({ title: 'Success', description: 'Company name updated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save company name.' });
    }
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a logo file to upload.' });
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(logoFile);
    reader.onloadend = async () => {
        const base64data = reader.result;
        try {
            const response = await fetch('/api/company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoUrl: base64data }),
            });
            if (!response.ok) throw new Error('Failed to upload logo');
            const { logoUrl: newLogoUrl } = await response.json();
            setLogoUrl(newLogoUrl);
            setCurrentLogo(newLogoUrl);
            toast({ title: 'Success', description: 'Logo updated successfully.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not upload logo.' });
        }
    }
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
              Please switch to an Admin role to access the Settings.
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
              <Input id="company-name" placeholder="Enter company name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
            </div>
            <Button onClick={handleSaveInfo}>Save Information</Button>
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
            <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
              {currentLogo ? (
                  <Image src={currentLogo} alt="Logo Preview" width={160} height={90} className="object-contain" />
              ) : (
                <p className="text-muted-foreground">Logo Preview</p>
              )}
            </div>
            <div className="flex gap-2">
                <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button variant="outline" onClick={handleLogoUploadClick}>
                <Upload className="mr-2 h-4 w-4" /> {currentLogo ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoFile && <Button onClick={handleSaveLogo}>Save Logo</Button>}
            </div>
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
