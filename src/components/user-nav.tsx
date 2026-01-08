
"use client";

import { useState } from "react";
import { useRole } from "@/contexts/role-context";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { users } from "@/lib/data";
import { Moon, Sun, LogOut, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";


export default function UserNav() {
  const { role, roles } = useRole();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentUser = users.find(u => u.role === (user as any)?.role) || users[0];
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const handleRoleSwitch = (newRole: string) => {
    if (newRole !== role) {
      logout();
      router.push(`/?role=${newRole.toLowerCase()}`);
      setDialogOpen(false);
    }
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <div className="flex items-center gap-4">
       <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-auto rounded-full px-2">
               <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user && <span className="hidden sm:inline-block font-medium">{user.username}</span>}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
                <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Switch Role
                </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
            <DialogHeader>
            <DialogTitle>Switch Role</DialogTitle>
            <DialogDescription>
                Select a role to log in as. You will be logged out of your current session.
            </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                {roles.map((r) => (
                    <Button 
                        key={r}
                        variant={role === r ? 'default' : 'outline'}
                        onClick={() => handleRoleSwitch(r)}
                    >
                        {r}
                    </Button>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
