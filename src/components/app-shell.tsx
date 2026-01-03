"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import MainNav from "@/components/main-nav";
import UserNav from "@/components/user-nav";
import { usePathname } from 'next/navigation';
import { ShieldCheck } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  const pageTitles: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/gate-pass": "Gate Pass Management",
    "/history": "Visitor History",
    "/management": "Complex Management",
    "/alerts": "Alerts",
    "/vehicles": "Vehicle Log",
    "/deliveries": "Delivery Management",
    "/staff": "Staff Management",
  };
  
  const currentTitle = pageTitles[pathname] || "SecurePass"; 

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar>
        <SidebarHeader className="p-4">
          <a href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="text-primary size-8" />
            <h1 className="text-xl font-bold text-foreground">SecurePass</h1>
          </a>
        </SidebarHeader>
        <SidebarContent className="p-2 pr-4">
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <div className={cn("flex flex-col sm:gap-4 sm:py-4 transition-all", sidebarState === 'expanded' ? "sm:pl-56" : "sm:pl-14")}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <h2 className="hidden text-xl font-semibold md:block">{currentTitle}</h2>
          <div className="relative ml-auto flex-1 md:grow-0">
             {/* Search bar could go here */}
          </div>
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppShellContent>{children}</AppShellContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}
