import { AppProvider } from '@/lib/store';
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Staffing Billing & Contracts',
  description: 'Billing and contract management solution',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
