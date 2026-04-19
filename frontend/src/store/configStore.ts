import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ConfigState {
  selectedModel: 'mistral' | 'gemini'
  setSelectedModel: (model: 'mistral' | 'gemini') => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      selectedModel: 'mistral',
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'forge-config',
    }
  )
)
