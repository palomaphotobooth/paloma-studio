"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; variant?: "success" | "error" };

type ToastContextValue = {
  toast: (payload: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((payload: Omit<Toast, "id">) => {
    const id = Date.now();
    setItems((prev) => [...prev, { ...payload, id }]);
    setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "min-w-64 rounded-lg border bg-white p-3 shadow-lg",
              item.variant === "error" ? "border-red-200" : "border-green-200"
            )}
          >
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used in ToastProvider");
  return context;
}
