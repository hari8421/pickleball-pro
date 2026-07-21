import { create } from 'zustand';

interface SessionStore {
  currentUID: string;
  setCurrentUID: (uid: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentUID: 'player-1',
  setCurrentUID: (uid) => set({ currentUID: uid }),
}));
