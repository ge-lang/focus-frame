// src/app/dashboard/layout.tsx
import AuthGuard from '@/components/auth-guard';
import { DashboardProvider } from '@/contexts/dashboard-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </AuthGuard>
  );
}