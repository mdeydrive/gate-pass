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
  Shield,
  Users,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Security", "Resident", "Manager"] },
  { href: "/gate-pass", label: "Gate Pass", icon: Ticket, roles: ["Security", "Resident"] },
  { href: "/history", label: "History", icon: History, roles: ["Admin", "Resident", "Manager"] },
  { href: "/security", label: "Security", icon: Shield, roles: ["Admin", "Security", "Manager"] },
  { href: "/management", label: "Management", icon: Building, roles: ["Admin"] },
];

export default function MainNav() {
  const pathname = usePathname();
  const { role } = useRole();

  const accessibleNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <nav className="grid items-start gap-1 font-medium">
      {accessibleNavItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === href && "bg-muted text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
