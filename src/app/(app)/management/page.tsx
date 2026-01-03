
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
import { complexes } from "@/lib/data";
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
import { useState } from "react";

function AddComplexDialog() {
  return (
    <Dialog>
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
            <Input id="name" placeholder="e.g. Tower C" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="blocks" className="text-right">
              Blocks
            </Label>
            <Input id="blocks" type="number" defaultValue="1" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="floors" className="text-right">
              Floors
            </Label>
            <Input id="floors" type="number" defaultValue="10" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="units" className="text-right">
              Units
            </Label>
            <Input id="units" type="number" defaultValue="40" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                Cancel
                </Button>
            </DialogClose>
            <Button type="submit">Create Complex</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function ManagementPage() {
    const { role } = useRole();

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
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Complex Management</h1>
                <p className="text-muted-foreground">Create and manage complexes, blocks, floors, and units.</p>
            </div>
            <AddComplexDialog />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                       <div className="flex justify-around text-sm">
                            <div className="text-center">
                                <p className="font-bold">{complex.blocks}</p>
                                <p className="text-muted-foreground">Blocks</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{complex.floors}</p>
                                <p className="text-muted-foreground">Floors</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{complex.units}</p>
                                <p className="text-muted-foreground">Units</p>
                            </div>
                       </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
