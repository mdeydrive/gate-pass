
import { RoleProvider } from "@/contexts/role-context";
import AppShell from "@/components/app-shell";
import { GatePassProvider } from "@/contexts/gate-pass-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <GatePassProvider>
        <AppShell>{children}</AppShell>
      </GatePassProvider>
    </RoleProvider>
  );
}
