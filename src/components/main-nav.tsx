
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, type UserRole } from "@/contexts/role-context";
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
  Settings,
  Database,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";


type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const allNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Security", "Resident", "Manager"] },
    { href: "/gate-pass", label: "Manage Gate Pass", icon: Ticket, roles: ["Security", "Resident", "Admin", "Manager", "Approver"] },
    { href: "/history", label: "History", icon: History, roles: ["Admin", "Security"] },
    { href: "/visitors", label: "Visitors", icon: Users, roles: ["Admin", "Security"] },
    { href: "/management", label: "Management", icon: Building, roles: ["Admin"] },
    { href: "/approving-authorities", label: "Approving Authorities", icon: ClipboardCheck, roles: ["Admin"] },
    { href: "/alerts", label: "Alerts", icon: AlertTriangle, roles: ["Security", "Admin"] },
    { href: "/vehicles", label: "Vehicles", icon: Car, roles: ["Admin", "Security"] },
    { href: "/database", label: "Database", icon: Database, roles: ["Admin"] },
    { href: "/deliveries", label: "Deliveries", icon: Package, roles: ["Security"] },
    { href: "/staff", label: "Staff", icon: Wrench, roles: ["Admin"] },
    { href: "/control-panel", label: "Control Panel", icon: Settings, roles: ["Admin"] },
  ];


export default function MainNav() {
  const pathname = usePathname();
  const { role } = useRole();
  const { setOpenMobile, isMobile } = useSidebar();

  const accessibleNavItems = allNavItems.filter(item => item.roles.includes(role));

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
              title={label}
              isActive={pathname.startsWith(href)}
              tooltip={label}
            >
              <Icon/>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
