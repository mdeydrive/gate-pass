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
import { approvingAuthorities } from '@/lib/data';
import { Phone } from 'lucide-react';

export default function ApprovingAuthoritiesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approving Authorities</CardTitle>
        <CardDescription>
          List of staff members responsible for approving gate passes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvingAuthorities.map((authority) => (
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
      </CardContent>
    </Card>
  );
}
