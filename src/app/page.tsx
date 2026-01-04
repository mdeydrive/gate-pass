
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function UserLoginForm({ onLogin, mobileInputRef }: { onLogin: (mobile: string, pass: string, type: 'user') => void, mobileInputRef: React.RefObject<HTMLInputElement> }) {
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
            ref={mobileInputRef}
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

function AdminLoginForm({ onLogin, passwordInputRef }: { onLogin: (id: string, pass: string, type: 'admin') => void, passwordInputRef: React.RefObject<HTMLInputElement> }) {
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
            ref={passwordInputRef}
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

function ApproverLoginForm({ onLogin, mobileInputRef }: { onLogin: (id: string, pass: string, type: 'approver') => void, mobileInputRef: React.RefObject<HTMLInputElement> }) {
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
            ref={mobileInputRef}
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

function ManagerLoginForm({ onLogin, mobileInputRef }: { onLogin: (id: string, pass: string, type: 'manager') => void, mobileInputRef: React.RefObject<HTMLInputElement> }) {
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
              ref={mobileInputRef}
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

  function SecurityLoginForm({ onLogin, mobileInputRef }: { onLogin: (id: string, pass: string, type: 'security') => void, mobileInputRef: React.RefObject<HTMLInputElement> }) {
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onLogin(mobileNumber, password, 'security');
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
             <Label htmlFor="security-mobile">Mobile Number</Label>
             <Input
              ref={mobileInputRef}
              id="security-mobile"
              type="text"
              placeholder="Enter your mobile number"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="security-password">Password</Label>
            <Input
              id="security-password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Security Login
          </Button>
        </div>
      </form>
    );
  }


export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('user');

  const userMobileInputRef = useRef<HTMLInputElement>(null);
  const adminPasswordInputRef = useRef<HTMLInputElement>(null);
  const approverMobileInputRef = useRef<HTMLInputElement>(null);
  const managerMobileInputRef = useRef<HTMLInputElement>(null);
  const securityMobileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const role = searchParams.get('role');
    const validRoles = ['user', 'admin', 'approver', 'manager', 'security'];
    const newTab = role && validRoles.includes(role) ? role : 'user';
    setActiveTab(newTab);

    if (!role && window.location.search) {
      router.replace('/', undefined);
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Focus the input when the tab becomes active
    setTimeout(() => {
        switch (activeTab) {
            case 'user':
                userMobileInputRef.current?.focus();
                break;
            case 'admin':
                adminPasswordInputRef.current?.focus();
                break;
            case 'approver':
                approverMobileInputRef.current?.focus();
                break;
            case 'manager':
                managerMobileInputRef.current?.focus();
                break;
            case 'security':
                securityMobileInputRef.current?.focus();
                break;
        }
    }, 100); // Small delay to ensure the input is visible
}, [activeTab]);


  const handleLogin = async (identifier: string, pass: string, type: 'user' | 'admin' | 'approver' | 'manager' | 'security') => {
    const success = await login(identifier, pass, type);
    if (success) {
        router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials provided.',
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/?role=${value}`, { scroll: false });
  }

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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="approver">Approver</TabsTrigger>
              <TabsTrigger value="manager">Manager</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="pt-4">
              <UserLoginForm onLogin={handleLogin} mobileInputRef={userMobileInputRef} />
            </TabsContent>
            <TabsContent value="admin" className="pt-4">
              <AdminLoginForm onLogin={handleLogin} passwordInputRef={adminPasswordInputRef} />
            </TabsContent>
            <TabsContent value="approver" className="pt-4">
              <ApproverLoginForm onLogin={handleLogin} mobileInputRef={approverMobileInputRef} />
            </TabsContent>
            <TabsContent value="manager" className="pt-4">
              <ManagerLoginForm onLogin={handleLogin} mobileInputRef={managerMobileInputRef} />
            </TabsContent>
             <TabsContent value="security" className="pt-4">
              <SecurityLoginForm onLogin={handleLogin} mobileInputRef={securityMobileInputRef} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
