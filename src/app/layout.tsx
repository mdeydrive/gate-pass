
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { RoleProvider } from '@/contexts/role-context';
import { CompanyProvider } from '@/contexts/company-context';
import { useEffect } from 'react';

const metadata: Metadata = {
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
          <title>{metadata.title as string}</title>
          <meta name="description" content={metadata.description as string} />
      </head>
      <body className={`font-body antialiased`}>
        <RoleProvider>
          <AuthProvider>
            <CompanyProvider>
              {children}
            </CompanyProvider>
          </AuthProvider>
        </RoleProvider>
        <Toaster />
      </body>
    </html>
  );
}
