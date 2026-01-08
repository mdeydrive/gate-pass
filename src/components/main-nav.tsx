
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Ticket,
  History,
  Building,
  AlertTriangle,
  Car,
  Package,
  Wrench,
  ClipboardCheck,
  Users,
  Database,
  FileText,
  Settings,
  Video,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Permission } from "@/lib/data";


type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: Permission;
};

const allNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
    { href: "/gate-pass", label: "Manage Gate Pass", icon: Ticket, permission: "gate-pass" },
    { href: "/history", label: "History", icon: History, permission: "history" },
    { href: "/visitors", label: "Visitors", icon: Users, permission: "visitors" },
    { href: "/management", label: "Management", icon: Building, permission: "management" },
    { href: "/approving-authorities", label: "Approving Authorities", icon: ClipboardCheck, permission: "approving-authorities" },
    { href: "/alerts", label: "Alerts", icon: AlertTriangle, permission: "alerts" },
    { href: "/vehicles", label: "Vehicles", icon: Car, permission: "vehicles" },
    { href: "/database", label: "Database", icon: Database, permission: "database" },
    { href: "/deliveries", label: "Deliveries", icon: Package, permission: "deliveries" },
    { href: "/staff", label: "Staff", icon: Wrench, permission: "staff" },
    { href: "/reports", label: "Reports", icon: FileText, permission: "reports" },
    { href: "/control-panel", label: "Control Panel", icon: Settings, permission: "control-panel" },
    { href: "/video-conference", label: "Video Conference", icon: Video, permission: "video-conference" },
  ];


export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setOpenMobile, isMobile, state } = useSidebar();

  const accessibleNavItems = allNavItems.filter(item => user?.permissions?.includes(item.permission));

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <SidebarMenu>
      {accessibleNavItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={label}>
          <Link href={href} onClick={handleLinkClick}>
            <SidebarMenuButton
              isActive={pathname.startsWith(href)}
              tooltip={label}
            >
              <Icon/>
              <span className={cn('flex-1 truncate', state === 'collapsed' && 'hidden')}>{label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
