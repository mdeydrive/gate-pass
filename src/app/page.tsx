
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function UserLoginForm({ onLogin }: { onLogin: (mobile: string, pass: string, type: 'user') => void }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(mobileNumber, password, 'user');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="mobile-number">Mobile Number</Label>
          <Input
            id="mobile-number"
            type="text"
            placeholder="Enter your mobile number"
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
    </form>
  );
}

function AdminLoginForm({ onLogin }: { onLogin: (id: string, pass: string, type: 'admin') => void }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', password, 'admin');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            placeholder="Enter admin password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Admin Login
        </Button>
      </div>
    </form>
  );
}

function ApproverLoginForm({ onLogin }: { onLogin: (id: string, pass: string, type: 'approver') => void }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(mobileNumber, password, 'approver');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
           <Label htmlFor="approver-mobile">Mobile Number</Label>
           <Input
            id="approver-mobile"
            type="text"
            placeholder="Enter your mobile number"
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="approver-password">Password</Label>
          <Input
            id="approver-password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Approver Login
        </Button>
      </div>
    </form>
  );
}

function ManagerLoginForm({ onLogin }: { onLogin: (id: string, pass: string, type: 'manager') => void }) {
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onLogin(mobileNumber, password, 'manager');
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
             <Label htmlFor="manager-mobile">Mobile Number</Label>
             <Input
              id="manager-mobile"
              type="text"
              placeholder="Enter your mobile number"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manager-password">Password</Label>
            <Input
              id="manager-password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Manager Login
          </Button>
        </div>
      </form>
    );
  }


export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (identifier: string, pass: string, type: 'user' | 'admin' | 'approver' | 'manager') => {
    const success = await login(identifier, pass, type);
    if (success) {
      if (type === 'approver') {
        router.push('/gate-pass');
      } else {
        router.push('/dashboard');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials provided.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SecurePass Login</CardTitle>
          <CardDescription>
            Select your role to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="approver">Approver</TabsTrigger>
              <TabsTrigger value="manager">Manager</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="pt-4">
              <UserLoginForm onLogin={handleLogin} />
            </TabsContent>
            <TabsContent value="admin" className="pt-4">
              <AdminLoginForm onLogin={handleLogin} />
            </TabsContent>
            <TabsContent value="approver" className="pt-4">
              <ApproverLoginForm onLogin={handleLogin} />
            </TabsContent>
            <TabsContent value="manager" className="pt-4">
              <ManagerLoginForm onLogin={handleLogin} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
