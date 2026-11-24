// A tiny publish/subscribe channel for short notifications ("Added to cart").
// Any module can call notify(); the Toaster component renders what it receives.

export type Toast = { id: number; message: string };
type Listener = (toast: Toast) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify(message: string): void {
  const toast: Toast = { id: nextId++, message };
  listeners.forEach((listener) => listener(toast));
}
