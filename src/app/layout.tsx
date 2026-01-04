
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { RoleProvider } from '@/contexts/role-context';

export const metadata: Metadata = {
  title: 'SecurePass',
  description: 'Gate Pass Management System by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
      </head>
      <body className={`font-body antialiased`}>
        <RoleProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </RoleProvider>
        <Toaster />
      </body>
    </html>
  );
}
