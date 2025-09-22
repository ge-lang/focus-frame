// src/app/dashboard/layout.tsx

import AuthGuard from '@/components/auth-guard'; 
import { DashboardProvider } from '@/contexts/dashboard-context'; 
import AddWidgetDialog from '@/components/add-widget-dialog'; 

export default function DashboardLayout({ children, }: 
  { children: React.ReactNode; })
   { return (
     <AuthGuard> <DashboardProvider> <> {children}
      <AddWidgetDialog /> </> 
      </DashboardProvider> </AuthGuard> ); }


