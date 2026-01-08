
'use client';
import { RoleProvider } from "@/contexts/role-context";
import AppShell from "@/components/app-shell";
import { GatePassProvider } from "@/contexts/gate-pass-context";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyProvider } from "@/contexts/company-context";
import IncomingCallDialog from "@/components/video/incoming-call-dialog";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <GatePassProvider>
            <AppShell>
                {children}
                <IncomingCallDialog />
            </AppShell>
        </GatePassProvider>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
