import { create } from 'zustand';

export interface WebSpeechUserSupport {
  userId: string;
  hasSupport: boolean;
  name?: string;
}

interface LiveTranscriptionStore {
  activeLocale: string;
  setActiveLocale: (locale: string) => void;
  started: boolean;
  setStarted: (started: boolean) => void;
  loadSince: string;
  setLoadSince: (since: string) => void;
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
  viewLocale: string;
  setViewLocale: (locale: string) => void;
  viewLocaleManuallySet: boolean;
  setViewLocaleManuallySet: (manuallySet: boolean) => void;
  spokenLocale: string;
  setSpokenLocale: (locale: string) => void;
  unsupportedWebspeechUsers: WebSpeechUserSupport[];
  setUnsupportedWebspeechUsers: (users: WebSpeechUserSupport[]) => void;
  addOrUpdateWebspeechUserSupport: (user: WebSpeechUserSupport) => void;
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
  viewLocale: '',
  setViewLocale: (locale) => set({ viewLocale: locale }),
  viewLocaleManuallySet: false,
  setViewLocaleManuallySet: (manuallySet) => set({ viewLocaleManuallySet: manuallySet }),
  spokenLocale: '',
  setSpokenLocale: (locale) => set({ spokenLocale: locale }),
  unsupportedWebspeechUsers: [],
  setUnsupportedWebspeechUsers: (users) => set({ unsupportedWebspeechUsers: users }),
  addOrUpdateWebspeechUserSupport: (user) => set((state) => {
    const existingIndex = state.unsupportedWebspeechUsers.findIndex(
      (u) => u.userId === user.userId,
    );
    if (existingIndex > -1) {
      const updated = [...state.unsupportedWebspeechUsers];
      updated[existingIndex] = user;
      return { unsupportedWebspeechUsers: updated };
    }
    return { unsupportedWebspeechUsers: [...state.unsupportedWebspeechUsers, user] };
  }),
}));
