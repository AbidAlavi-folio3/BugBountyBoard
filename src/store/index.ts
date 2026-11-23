import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartLine, Product, User } from '../types/api';
type CartState = { lines: CartLine[] };
const readCart = (): CartLine[] => {
  try {
    const value = JSON.parse(localStorage.getItem('bazaar-cart') || '[]') as unknown;
    return Array.isArray(value) ? (value as CartLine[]) : [];
  } catch {
    return [];
  }
};
const cartSlice = createSlice({
  name: 'cart',
  initialState: { lines: readCart() } as CartState,
  reducers: {
    add(state, action: PayloadAction<Product>) {
      const p = action.payload;
      const line = state.lines.find((l) => l.product.id === p.id);
      if (line) {
        if (line.quantity < p.stock) line.quantity += 1;
        line.product = p;
      } else if (p.stock > 0) state.lines.push({ product: p, quantity: 1 });
    },
    quantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const line = state.lines.find((l) => l.product.id === action.payload.id);
      if (line) line.quantity = Math.min(line.product.stock, Math.max(1, action.payload.quantity));
    },
    remove(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((l) => l.product.id !== action.payload);
    },
    clear(state) {
      state.lines = [];
    },
    syncStock(state, action: PayloadAction<Product[]>) {
      const byId = new Map(action.payload.map((p) => [p.id, p]));
      state.lines = state.lines.flatMap((l) => {
        const p = byId.get(l.product.id);
        if (!p) return [l];
        return p.stock === 0 ? [] : [{ product: p, quantity: Math.min(l.quantity, p.stock) }];
      });
    },
  },
});
type SessionState = { token: string | null; user: User | null };
const readSession = (): SessionState => {
  try {
    return JSON.parse(
      sessionStorage.getItem('bazaar-session') || '{"token":null,"user":null}',
    ) as SessionState;
  } catch {
    return { token: null, user: null };
  }
};
const sessionSlice = createSlice({
  name: 'session',
  initialState: readSession(),
  reducers: {
    signIn(_state, action: PayloadAction<{ token: string; user: User }>) {
      return action.payload;
    },
    signOut() {
      return { token: null, user: null };
    },
  },
});
export const cartActions = cartSlice.actions;
export const sessionActions = sessionSlice.actions;
export const store = configureStore({
  reducer: { cart: cartSlice.reducer, session: sessionSlice.reducer },
});
store.subscribe(() => {
  try {
    localStorage.setItem('bazaar-cart', JSON.stringify(store.getState().cart.lines));
    sessionStorage.setItem('bazaar-session', JSON.stringify(store.getState().session));
  } catch {
    /* storage disabled */
  }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
