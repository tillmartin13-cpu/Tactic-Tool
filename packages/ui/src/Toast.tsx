import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  const toast = useCallback((message: string) => {
    setMsg(message);
    setVisible(true);
    window.setTimeout(() => setVisible(false), 2800);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible && (
        <div
          className="fixed bottom-6 left-1/2 z-[6000] -translate-x-1/2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-lg"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
