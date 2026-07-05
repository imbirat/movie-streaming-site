import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  preferredServer: string;
  autoplay: boolean;
  subtitlesEnabled: boolean;
  reduceAnimations: boolean;

  setPreferredServer: (id: string) => void;
  setAutoplay: (v: boolean) => void;
  setSubtitlesEnabled: (v: boolean) => void;
  setReduceAnimations: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferredServer: 'vidlink',
      autoplay: true,
      subtitlesEnabled: true,
      reduceAnimations: false,

      setPreferredServer: (id) => set({ preferredServer: id }),
      setAutoplay: (v) => set({ autoplay: v }),
      setSubtitlesEnabled: (v) => set({ subtitlesEnabled: v }),
      setReduceAnimations: (v) => set({ reduceAnimations: v }),
    }),
    { name: 'strelix-settings' },
  ),
);
