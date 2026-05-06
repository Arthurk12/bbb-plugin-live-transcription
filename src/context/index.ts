import { create } from 'zustand';

interface LiveTranscriptionStore {
  activeLocale: string;
  setActiveLocale: (locale: string) => void;
  started: boolean;
  setStarted: (started: boolean) => void;
}

export const useLiveTranscriptionStore = create<LiveTranscriptionStore>((set) => ({
  activeLocale: '',
  setActiveLocale: (locale) => set({ activeLocale: locale }),
  started: false,
  setStarted: (started) => set({ started }),
}));
