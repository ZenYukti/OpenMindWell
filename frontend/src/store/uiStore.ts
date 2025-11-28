import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  setSidebarOpen: (open: boolean) => void
  setDarkMode: (dark: boolean) => void
  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setDarkMode: (darkMode) => set({ darkMode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'openmindwell-ui',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
