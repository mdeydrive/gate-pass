
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApprovingAuthority } from '@/lib/data';
import { Phone } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface UserListProps {
    onSelectUser: (user: ApprovingAuthority) => void;
    selectedUser: ApprovingAuthority | null;
}

export default function UserList({ onSelectUser, selectedUser }: UserListProps) {
    const [authorities, setAuthorities] = useState<ApprovingAuthority[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        async function fetchAuthorities() {
            try {
                setLoading(true);
                const response = await fetch('/api/authorities');
                if (!response.ok) throw new Error("Failed to fetch users.");
                const data = await response.json();
                // Filter out the current user from the list
                const filteredData = data.filter((auth: ApprovingAuthority) => auth.id !== currentUser?.id);
                setAuthorities(filteredData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAuthorities();
    }, [currentUser]);

    const filteredUsers = authorities.filter(auth =>
        auth.name.toLowerCase().includes(filter.toLowerCase()) && auth.status === 'Active'
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Select a user to start a call.</CardDescription>
                <Input 
                    placeholder="Search users..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-center space-x-4">
                             <Skeleton className="h-12 w-12 rounded-full" />
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-[150px]" />
                               <Skeleton className="h-4 w-[100px]" />
                             </div>
                           </div>
                        ))}
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(auth => (
                        <div key={auth.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={auth.avatar} alt={auth.name} />
                                    <AvatarFallback>{auth.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{auth.name}</p>
                                    <p className="text-sm text-muted-foreground">{auth.role}</p>
                                </div>
                            </div>
                             <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => onSelectUser(auth)}
                                disabled={!!selectedUser}
                            >
                                <Phone className="h-4 w-4" />
                                <span className="sr-only">Call</span>
                             </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">No active users found.</p>
                )}
            </CardContent>
        </Card>
    );
}
