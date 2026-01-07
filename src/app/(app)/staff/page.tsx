
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

function AddStaffDialog({ onAddStaff }: { onAddStaff: (newStaff: Omit<ApprovingAuthority, 'id' | 'avatar'>) => void }) {
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
        description: "Please fill out all fields to add a new staff member.",
      });
      return;
    }
    // New users are active by default with no permissions.
    const newStaff = { name, role, mobileNumber, email, status: 'Active' as const, permissions: [] };
    onAddStaff(newStaff);
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
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
            <Button type="submit" onClick={handleSubmit}>Add Staff</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditStaffDialog({ staff, onUpdateStaff }: { staff: ApprovingAuthority, onUpdateStaff: (updatedStaff: ApprovingAuthority) => void }) {
  const [name, setName] = useState(staff.name);
  const [role, setRole] = useState(staff.role);
  const [mobileNumber, setMobileNumber] = useState(staff.mobileNumber);
  const [email, setEmail] = useState(staff.email);
  const [status, setStatus] = useState(staff.status);
  const [permissions, setPermissions] = useState<Permission[]>(staff.permissions || []);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(staff.name);
    setRole(staff.role);
    setMobileNumber(staff.mobileNumber);
    setEmail(staff.email);
    setStatus(staff.status);
    setPermissions(staff.permissions || []);
  }, [staff, open]);

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
    const updatedStaff = { ...staff, name, role, mobileNumber, email, status, permissions };
    onUpdateStaff(updatedStaff);
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
          <DialogTitle>Edit Staff Member: {staff.name}</DialogTitle>
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


export default function StaffPage() {
  const { role } = useRole();
  const [staff, setStaff] = useState<ApprovingAuthority[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStaff() {
      try {
        setLoading(true);
        const response = await fetch('/api/authorities');
        if (!response.ok) throw new Error("Failed to fetch staff.");
        const data = await response.json();
        setStaff(data);
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch staff members." });
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [toast]);

  const handleAddStaff = async (newStaffData: Omit<ApprovingAuthority, 'id' | 'avatar'>) => {
    try {
      const response = await fetch('/api/authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffData),
      });

      if (!response.ok) throw new Error('Failed to save the new staff member');

      const savedStaff = await response.json();
      setStaff(prev => [savedStaff, ...prev]);
      toast({ title: "Success", description: "New staff member has been added." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add new staff member." });
    }
  };

  const handleUpdateStaff = async (updatedStaffData: ApprovingAuthority) => {
    try {
      const response = await fetch('/api/authorities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaffData),
      });

      if (!response.ok) throw new Error('Failed to update the staff member');

      const updatedStaff = await response.json();
      setStaff(prev => prev.map(auth => auth.id === updatedStaff.id ? updatedStaff : auth));
      toast({ title: "Success", description: "Staff details have been updated." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update staff member." });
    }
  };
  
  const allowedRoles: (string | undefined)[] = ['Admin', 'Manager', 'Security'];
  if (!allowedRoles.includes(role)) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please contact an administrator to access this page.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            List of all staff members in the system.
          </CardDescription>
        </div>
        {role === 'Admin' && <AddStaffDialog onAddStaff={handleAddStaff} />}
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
                <TableHead>Staff ID</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    <div className="font-mono text-xs">{staffMember.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={staffMember.avatar} alt={staffMember.name} />
                        <AvatarFallback>{staffMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{staffMember.name}</p>
                        <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{staffMember.role}</Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant={staffMember.status === 'Active' ? 'success' : 'destructive'}>
                        <div className="flex items-center gap-1">
                          {staffMember.status === 'Active' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {staffMember.status}
                        </div>
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{staffMember.mobileNumber}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                    {role === 'Admin' && <EditStaffDialog staff={staffMember} onUpdateStaff={handleUpdateStaff} />}
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
