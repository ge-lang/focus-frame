// src/hooks/use-confirm-dialog.ts
'use client';
import { useState } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        message,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  };

  const cancel = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    isOpen,
    message: config?.message || '',
    onConfirm: config?.onConfirm || (() => {}),
    onCancel: cancel,
    confirm
  };
}