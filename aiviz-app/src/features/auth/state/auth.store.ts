import { create } from "zustand";
import type { User } from "@/features/auth/types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  setAuthenticated: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setHydrated: (hydrated) => set({ hydrated }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));
