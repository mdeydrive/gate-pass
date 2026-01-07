
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
import { Phone, PlusCircle, Edit, UserCheck, UserX } from 'lucide-react';
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
import type { ApprovingAuthority, Permission } from '@/lib/data';
import { allPermissions } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

function AddAuthorityDialog({ onAddAuthority }: { onAddAuthority: (newAuthority: Omit<ApprovingAuthority, 'id' | 'avatar'>) => void }) {
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
    const newAuthority = { name, role, mobileNumber, email, status: 'Active' as const, permissions: [] };
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
            <Input id="name" placeholder="Enter full name" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Resident">Resident</SelectItem>
                    <SelectItem value="Approver">Approver</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Gatepass Manager</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mobile" className="text-right">Mobile No.</Label>
            <Input id="mobile" placeholder="Enter 10-digit mobile number" className="col-span-3" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" placeholder="Enter email address" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
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

function EditAuthorityDialog({ authority, onUpdateAuthority }: { authority: ApprovingAuthority, onUpdateAuthority: (updatedAuthority: ApprovingAuthority) => void }) {
  const [name, setName] = useState(authority.name);
  const [role, setRole] = useState(authority.role);
  const [mobileNumber, setMobileNumber] = useState(authority.mobileNumber);
  const [email, setEmail] = useState(authority.email);
  const [status, setStatus] = useState(authority.status);
  const [permissions, setPermissions] = useState<Permission[]>(authority.permissions || []);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(authority.name);
    setRole(authority.role);
    setMobileNumber(authority.mobileNumber);
    setEmail(authority.email);
    setStatus(authority.status);
    setPermissions(authority.permissions || []);
  }, [authority, open]);

  const handlePermissionChange = (permissionId: Permission, checked: boolean) => {
    setPermissions(prev => 
        checked ? [...prev, permissionId] : prev.filter(p => p !== permissionId)
    );
  };

  const handleSubmit = () => {
    if (!name || !role || !mobileNumber || !email) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields.",
      });
      return;
    }
    const updatedAuthority = { ...authority, name, role, mobileNumber, email, status, permissions };
    onUpdateAuthority(updatedAuthority);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Approving Authority: {authority.name}</DialogTitle>
          <DialogDescription>
            Update user details, status, and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">User Details</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                    <Input id="edit-name" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-role" className="text-right">Role</Label>
                    <Select onValueChange={setRole} value={role}>
                        <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Resident">Resident</SelectItem>
                            <SelectItem value="Approver">Approver</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Gatepass Manager</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-mobile" className="text-right">Mobile No.</Label>
                    <Input id="edit-mobile" className="col-span-3" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter 10-digit mobile number" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right">Email</Label>
                    <Input id="edit-email" type="email" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-status" className="text-right">Status</Label>
                    <div className="col-span-3 flex items-center gap-2">
                        <Switch id="edit-status" checked={status === 'Active'} onCheckedChange={(checked) => setStatus(checked ? 'Active' : 'Inactive')} />
                        <span className={status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                            {status}
                        </span>
                    </div>
                 </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Permissions</h3>
                <ScrollArea className="h-60 w-full rounded-md border p-4">
                    <div className="space-y-2">
                        {allPermissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`perm-${permission.id}`}
                                    checked={permissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                />
                                <Label htmlFor={`perm-${permission.id}`} className="font-normal">{permission.label}</Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function ApprovingAuthoritiesPage() {
  const { role } = useRole();
  const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
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

  const handleAddAuthority = async (newAuthorityData: Omit<ApprovingAuthority, 'id' | 'avatar'>) => {
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

  const handleUpdateAuthority = async (updatedAuthorityData: ApprovingAuthority) => {
    try {
      const response = await fetch('/api/authorities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAuthorityData),
      });

      if (!response.ok) throw new Error('Failed to update the authority');

      const updatedAuthority = await response.json();
      setAuthorities(prev => prev.map(auth => auth.id === updatedAuthority.id ? updatedAuthority : auth));
      toast({ title: "Success", description: "Authority details have been updated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update authority." });
    }
  };

  if (role !== 'Admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please switch to an Admin role to access this page.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

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
                <TableHead>Status</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Actions</TableHead>
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
                      <Badge variant={authority.status === 'Active' ? 'success' : 'destructive'}>
                        <div className="flex items-center gap-1">
                          {authority.status === 'Active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {authority.status}
                        </div>
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{authority.mobileNumber}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                    {role === 'Admin' && <EditAuthorityDialog authority={authority} onUpdateAuthority={handleUpdateAuthority} />}
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
