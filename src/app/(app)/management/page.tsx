

"use client";

import { useRole } from "@/contexts/role-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Building, Users, KeyRound, MoreVertical } from "lucide-react";
import type { Complex } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function AddComplexDialog({ onAddComplex }: { onAddComplex: (newComplex: Omit<Complex, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [blocks, setBlocks] = useState(1);
  const [floors, setFloors] = useState(10);
  const [units, setUnits] = useState(40);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name) {
        toast({
            variant: "destructive",
            title: "Missing Name",
            description: "Please enter a name for the complex.",
        });
        return;
    }
    const newComplex = {
      name,
      blocks,
      floors,
      units,
    };
    onAddComplex(newComplex);
    setOpen(false); // Close the dialog after submission
    // Reset form
    setName('');
    setBlocks(1);
    setFloors(10);
    setUnits(40);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Complex
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Complex</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new complex.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" placeholder="Enter complex or tower name" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="blocks" className="text-right">
              Blocks
            </Label>
            <Input id="blocks" type="number" className="col-span-3" value={blocks} onChange={(e) => setBlocks(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="floors" className="text-right">
              Floors
            </Label>
            <Input id="floors" type="number" className="col-span-3" value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="units" className="text-right">
              Units
            </Label>
            <Input id="units" type="number" className="col-span-3" value={units} onChange={(e) => setUnits(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                Cancel
                </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>Create Complex</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function ManagementPage() {
    const { role } = useRole();
    const [complexes, setComplexes] = useState<Complex[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchComplexes() {
            try {
                setLoading(true);
                const response = await fetch('/api/complexes');
                if (!response.ok) throw new Error("Failed to fetch complexes.");
                const data = await response.json();
                setComplexes(data);
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch complexes." });
            } finally {
                setLoading(false);
            }
        }
        fetchComplexes();
    }, [toast]);

    const handleAddComplex = async (newComplexData: Omit<Complex, 'id'>) => {
        try {
            const response = await fetch('/api/complexes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComplexData),
            });

            if (!response.ok) throw new Error('Failed to save the new complex.');

            const savedComplex = await response.json();
            setComplexes(prev => [...prev, savedComplex]);
            toast({ title: "Success", description: "New complex has been added." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add new complex." });
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
                        <p>Please switch to an Admin role to manage complexes.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Complex Management</h1>
                <p className="text-muted-foreground">Create and manage complexes, blocks, floors, and units.</p>
            </div>
            <AddComplexDialog onAddComplex={handleAddComplex} />
        </div>
        {loading ? (
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
             </div>
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {complexes.map((complex) => (
                    <Card key={complex.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold">{complex.name}</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Manage Units</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <Separator />
                        <div className="flex justify-around text-sm pt-4">
                                <div className="text-center">
                                    <p className="font-bold text-lg">{complex.blocks}</p>
                                    <p className="text-xs text-muted-foreground">Blocks</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg">{complex.floors}</p>
                                    <p className="text-xs text-muted-foreground">Floors</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg">{complex.units}</p>
                                    <p className="text-xs text-muted-foreground">Units</p>
                                </div>
                        </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
