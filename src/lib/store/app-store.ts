import { create } from "zustand";

type AppStore = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

/**
 * Foundation Zustand store for client-side UI state.
 * Not wired to layout components yet — available for Sprint 002+.
 */
export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
