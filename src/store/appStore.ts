// ============================================================
// DevMind — Zustand App Store
// Holds global UI state: selected topic, authenticated user.
// ============================================================

import { create } from "zustand";
import type { AppUser } from "../types";

interface AppState {
  // Auth
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;

  // Navigation
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;

  // Canvas: which block is focused in the source panel
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;

  // Mobile navigation
  mobileTab: "topics" | "search" | "settings";
  setMobileTab: (tab: "topics" | "search" | "settings") => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  selectedTopicId: null,
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),

  selectedBlockId: null,
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),

  mobileTab: "topics",
  setMobileTab: (tab) => set({ mobileTab: tab }),

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
