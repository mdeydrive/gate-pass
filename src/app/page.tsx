
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
import { PinInput } from '@/components/ui/pin-input';
import { useCompany } from '@/contexts/company-context';
import { Skeleton } from '@/components/ui/skeleton';

function UserLoginForm({ onLogin, mobileInputRef }: { onLogin: (mobile: string, pass: string, type: 'user') => void, mobileInputRef: React.RefObject<HTMLInputElement> }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length <= 10) {
      setMobileNumber(value);
      if (value.length === 10) {
        pinInputRef.current?.focus();
      }
    }
  };

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
            type="tel"
            placeholder="Enter your mobile number"
            required
            value={mobileNumber}
            onChange={handleMobileChange}
            maxLength={10}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">4-Digit PIN</Label>
           <PinInput 
             value={password}
             onChange={setPassword}
             onComplete={(pin) => onLogin(mobileNumber, pin, 'user')}
             inputRef={pinInputRef}
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
          <Label htmlFor="admin-password">4-Digit PIN</Label>
          <PinInput 
             value={password}
             onChange={setPassword}
             onComplete={(pin) => onLogin('admin', pin, 'admin')}
             inputRef={passwordInputRef}
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
  const pinInputRef = useRef<HTMLInputElement>(null);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
      if (value.length === 10) {
        pinInputRef.current?.focus();
      }
    }
  };

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
            type="tel"
            placeholder="Enter your mobile number"
            required
            value={mobileNumber}
            onChange={handleMobileChange}
            maxLength={10}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="approver-password">4-Digit PIN</Label>
           <PinInput 
             value={password}
             onChange={setPassword}
             onComplete={(pin) => onLogin(mobileNumber, pin, 'approver')}
             inputRef={pinInputRef}
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
    const pinInputRef = useRef<HTMLInputElement>(null);
    
    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
          setMobileNumber(value);
          if (value.length === 10) {
            pinInputRef.current?.focus();
          }
        }
    };
  
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
              type="tel"
              placeholder="Enter your mobile number"
              required
              value={mobileNumber}
              onChange={handleMobileChange}
              maxLength={10}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manager-password">4-Digit PIN</Label>
            <PinInput 
             value={password}
             onChange={setPassword}
             onComplete={(pin) => onLogin(mobileNumber, pin, 'manager')}
             inputRef={pinInputRef}
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
    const pinInputRef = useRef<HTMLInputElement>(null);
  
    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
          setMobileNumber(value);
          if (value.length === 10) {
            pinInputRef.current?.focus();
          }
        }
    };

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
              type="tel"
              placeholder="Enter your mobile number"
              required
              value={mobileNumber}
              onChange={handleMobileChange}
              maxLength={10}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="security-password">4-Digit PIN</Label>
            <PinInput 
             value={password}
             onChange={setPassword}
             onComplete={(pin) => onLogin(mobileNumber, pin, 'security')}
             inputRef={pinInputRef}
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
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('user');
  const { companyName, logoUrl, loading: companyLoading } = useCompany();

  const userMobileInputRef = useRef<HTMLInputElement>(null);
  const adminPasswordInputRef = useRef<HTMLInputElement>(null);
  const approverMobileInputRef = useRef<HTMLInputElement>(null);
  const managerMobileInputRef = useRef<HTMLInputElement>(null);
  const securityMobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        router.push('/dashboard');
    }
  }, [user, router]);


  useEffect(() => {
    const role = searchParams.get('role');
    const validRoles = ['user', 'admin', 'approver', 'manager', 'security'];
    const newTab = role && validRoles.includes(role) ? role : 'user';
    
    if (activeTab !== newTab) {
        setActiveTab(newTab);
    }

    if (!role && window.location.search) {
      router.replace('/', undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (pass.length < 4) {
      toast({
        variant: 'destructive',
        title: 'PIN incomplete',
        description: 'Please enter a 4-digit PIN.',
      });
      return;
    }
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="mb-8 flex flex-col items-center gap-4">
            {companyLoading ? (
                <Skeleton className="h-32 w-32 rounded-md" />
            ) : logoUrl ? (
                <Image src={logoUrl} alt={companyName} width={128} height={128} className="h-32 w-32 object-contain" />
            ) : (
                 <div className="h-32 w-32 bg-background rounded-md flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-16 w-16 text-primary"
                    >
                        <path d="M13 16h- момент-4v-4h4v4Z" fill="currentColor" strokeWidth="0" />
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                        <path d="M13 16h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z" />
                    </svg>
                 </div>
            )}
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{companyName} Login</CardTitle>
          <CardDescription>
            Select your role to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="approver">Approver</TabsTrigger>
                <TabsTrigger value="manager">Manager</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
            </div>
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

    