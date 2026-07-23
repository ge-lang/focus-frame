'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ToastType } from '@/lib/toast';

type Toast = { id: number; message: string; type: ToastType };

const styles: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: { icon: <CheckCircle2 size={18} />, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: <XCircle size={18} />, className: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: <Info size={18} />, className: 'border-blue-200 bg-blue-50 text-blue-800' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const { message, type } = (event as CustomEvent<Omit<Toast, 'id'>>).detail;
      const id = Date.now();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
    };
    window.addEventListener('focus-frame:toast', handleToast);
    return () => window.removeEventListener('focus-frame:toast', handleToast);
  }, []);

  return <>{children}<div aria-live="polite" className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
    {toasts.map((toast) => <div key={toast.id} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${styles[toast.type].className}`}>{styles[toast.type].icon}{toast.message}</div>)}
  </div></>;
}
