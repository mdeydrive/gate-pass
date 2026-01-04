
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, type UserRole } from "@/contexts/role-context";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";


type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Security", "Resident", "Manager"] },
  { href: "/gate-pass", label: "Manage Gate Pass", icon: Ticket, roles: ["Security", "Resident", "Admin", "Manager"] },
  { href: "/manage-gate-passes", label: "New gate pass", icon: Ticket, roles: ["Security", "Resident", "Admin", "Manager"] },
  { href: "/history", label: "History", icon: History, roles: ["Admin", "Security", "Resident", "Manager"] },
  { href: "/visitors", label: "Visitors", icon: Users, roles: ["Admin", "Security", "Manager"] },
  { href: "/management", label: "Management", icon: Building, roles: ["Admin", "Manager"] },
  { href: "/approving-authorities", label: "Approving Authorities", icon: ClipboardCheck, roles: ["Admin", "Manager"] },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle, roles: ["Security", "Admin", "Manager"] },
  { href: "/vehicles", label: "Vehicles", icon: Car, roles: ["Admin", "Security"] },
  { href: "/deliveries", label: "Deliveries", icon: Package, roles: ["Security", "Resident"] },
  { href: "/staff", label: "Staff", icon: Wrench, roles: ["Admin", "Manager"] },
];

export default function MainNav() {
  const pathname = usePathname();
  const { role } = useRole();

  const accessibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <SidebarMenu>
      {accessibleNavItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={label}>
          <Link href={href}>
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
