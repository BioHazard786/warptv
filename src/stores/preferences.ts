import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  hideNsfw: boolean
  autoplay: boolean
  useProxy: boolean
  view: 'grid' | 'list'
  set: (patch: Partial<Omit<PreferencesState, 'set'>>) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      hideNsfw: true,
      autoplay: true,
      useProxy: true,
      view: 'grid',
      set: (patch) => set(patch),
    }),
    {
      name: 'warptv:preferences',
      partialize: ({ set: _set, ...rest }) => rest,
    },
  ),
)
