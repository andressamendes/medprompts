import { useState, useEffect } from 'react';

export type ToastProps = {
  title: string;
  description?:  string;
  variant?: 'default' | 'destructive';
};

type ToastType = ToastProps & {
  id: string;
};

let toastCount = 0;
const listeners:  Array<(toasts: ToastType[]) => void> = [];
let memoryState: ToastType[] = [];

function dispatch(toasts: ToastType[]) {
  memoryState = toasts;
  listeners.forEach((listener) => listener(toasts));
}

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const id = (++toastCount).toString();
  const newToast: ToastType = { id, title, description, variant };
  
  dispatch([...memoryState, newToast]);
  
  // Auto-remove após 3 segundos
  setTimeout(() => {
    dispatch(memoryState.filter((t) => t.id !== id));
  }, 3000);
  
  return {
    id,
    dismiss: () => dispatch(memoryState.filter((t) => t.id !== id)),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) {
        listeners. splice(index, 1);
      }
    };
  }, []);

  return {
    toast,
    toasts,
    dismiss: (id: string) => dispatch(memoryState.filter((t) => t.id !== id)),
  };
}