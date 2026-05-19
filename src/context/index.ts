import { create } from 'zustand';

interface LiveTranscriptionStore {
  activeLocale: string;
  setActiveLocale: (locale: string) => void;
  started: boolean;
  setStarted: (started: boolean) => void;
  loadSince: string;
  setLoadSince: (since: string) => void;
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

export const useLiveTranscriptionStore = create<LiveTranscriptionStore>((set) => ({
  activeLocale: '',
  setActiveLocale: (locale) => set({ activeLocale: locale }),
  started: false,
  setStarted: (started) => set({ started }),
  loadSince: new Date(0).toISOString(), // default to epoch time to load all captions
  setLoadSince: (since) => set({ loadSince: since }),
  currentLocale: '',
  setCurrentLocale: (locale) => set({ currentLocale: locale }),
}));
