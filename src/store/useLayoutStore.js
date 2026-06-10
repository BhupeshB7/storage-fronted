import { create } from "zustand";

const STORAGE_KEY = "drive:layout";

export const useLayoutStore = create((set) => ({
  layout: localStorage.getItem(STORAGE_KEY) || "list",

  setLayout: (layout) => {
    localStorage.setItem(STORAGE_KEY, layout);
    set({ layout });
  },

  toggleLayout: () =>
    set((state) => {
      const nextLayout = state.layout === "list" ? "grid" : "list";
      localStorage.setItem(STORAGE_KEY, nextLayout);
      return { layout: nextLayout };
    }),
}));
