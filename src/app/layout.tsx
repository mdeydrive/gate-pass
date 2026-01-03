import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
