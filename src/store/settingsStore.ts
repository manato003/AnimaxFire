import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  showOnlyJapanese: boolean;
  setShowOnlyJapanese: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showOnlyJapanese: true,
      setShowOnlyJapanese: (show) => set({ showOnlyJapanese: show }),
    }),
    {
      name: 'anime-settings-storage',
    }
  )
);