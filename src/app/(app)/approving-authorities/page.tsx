'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PlusCircle } from 'lucide-react';
import { useRole } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Authority = {
  id: string;
  name: string;
  role: string;
  mobileNumber: string;
  email: string;
  avatar: string;
};


function AddAuthorityDialog({ onAddAuthority }: { onAddAuthority: (newAuthority: Omit<Authority, 'id' | 'avatar'>) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !role || !mobileNumber || !email) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields to add a new authority.",
      });
      return;
    }
    const newAuthority = { name, role, mobileNumber, email };
    onAddAuthority(newAuthority);
    setOpen(false); // Close the dialog after submission
    // Reset form
    setName('');
    setRole('');
    setMobileNumber('');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Authority
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Approving Authority</DialogTitle>
          <DialogDescription>
            Fill in the details for the new staff member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" placeholder="e.g. John Doe" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Resident">User</SelectItem>
                    <SelectItem value="Approver">Approver</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Gatepass Manager</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mobile" className="text-right">Mobile No.</Label>
            <Input id="mobile" placeholder="e.g. 9876543210" className="col-span-3" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" placeholder="e.g. john.d@company.com" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>Add Authority</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ApprovingAuthoritiesPage() {
  const { role } = useRole();
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAuthorities() {
      try {
        setLoading(true);
        const response = await fetch('/api/authorities');
        if (!response.ok) throw new Error("Failed to fetch authorities.");
        const data = await response.json();
        setAuthorities(data);
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch approving authorities." });
      } finally {
        setLoading(false);
      }
    }
    fetchAuthorities();
  }, [toast]);

  const handleAddAuthority = async (newAuthorityData: Omit<Authority, 'id' | 'avatar'>) => {
    try {
      const response = await fetch('/api/authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuthorityData),
      });

      if (!response.ok) throw new Error('Failed to save the new authority');

      const savedAuthority = await response.json();
      setAuthorities(prev => [savedAuthority, ...prev]);
      toast({ title: "Success", description: "New approving authority has been added." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add new authority." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Approving Authorities</CardTitle>
          <CardDescription>
            List of staff members responsible for approving gate passes.
          </CardDescription>
        </div>
        {role === 'Admin' && <AddAuthorityDialog onAddAuthority={handleAddAuthority} />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorities.map((authority) => (
                <TableRow key={authority.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={authority.avatar} alt={authority.name} />
                        <AvatarFallback>{authority.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{authority.name}</p>
                        <p className="text-sm text-muted-foreground">{authority.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{authority.role}</Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{authority.mobileNumber}</span>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
