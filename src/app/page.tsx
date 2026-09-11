// src/app/page.tsx
/*import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">FocusFrame</h1>
        <p className="text-lg mb-8">Your Personal Productivity Dashboard</p>
        <Link 
          href="/dashboard" 
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Launch Dashboard
        </Link>
      </div>
    </div>
  );
}*/

// src/app/page.tsx
import  AuthGuard  from '@/components/auth-guard';
import { DashboardGrid } from '@/components/dashboard-grid';
import { EditToggle } from '@/components/edit-toggle';
import { WidgetPicker } from '@/components/widget-picker';
import { AuthButton } from '@/components/auth-button';
import { MobileStickyActions } from '@/components/mobile-sticky-actions';
import { ThemeControl } from '@/components/theme-control';
import { ThemeWorkspace } from '@/components/theme-workspace';
import { EvvaMark } from '@/components/evva-mark';

export default function Home() {
  return (
    <AuthGuard>
      <ThemeWorkspace>
        <div className="ff-app-frame mx-auto max-w-[1440px]">
          <header className="ff-topbar">
            <div className="ff-brand">
              <span className="ff-brand-mark" aria-hidden="true"><EvvaMark /></span>
              <div>
                <h1 className="ff-brand-title">FocusFrame</h1>
                <span className="ff-brand-subtitle">A MORE FOCUSED YOU</span>
              </div>
            </div>

            <div className="ff-topbar-actions">
              <AuthButton />
              <div className="ff-action-divider" aria-hidden="true" />
              <ThemeControl />
              <WidgetPicker />
              <EditToggle />
            </div>
          </header>

          <MobileStickyActions />

          <div className="ff-dashboard-stage">
            <DashboardGrid />
          </div>

          <footer className="ff-page-signature" aria-label="FocusFrame signature">
            <span>Small steps. A calmer mind.</span>
            <span><i aria-hidden="true">—</i> FocusFrame</span>
          </footer>
        </div>
      </ThemeWorkspace>
    </AuthGuard>
  );
}
