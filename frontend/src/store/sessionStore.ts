import { create } from 'zustand';

interface SessionStore {
  currentUID: string;
  isAdmin: boolean;
  token: string | null;
  setCurrentUID: (uid: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setToken: (token: string | null) => void;
  displayName: string | null;
  username: string | null;
  setDisplayName: (name: string | null) => void;
  setUsername: (username: string | null) => void;
  login: (token: string, isAdmin?: boolean, currentUID?: string, displayName?: string, username?: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentUID: 'player-1',
  isAdmin: false,
  token: localStorage.getItem('token') || null,
  displayName: localStorage.getItem('displayName') || null,
  username: localStorage.getItem('username') || null,
  setCurrentUID: (uid) => set({ currentUID: uid }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setDisplayName: (name) => {
    if (name) localStorage.setItem('displayName', name);
    else localStorage.removeItem('displayName');
    set({ displayName: name });
  },
  setUsername: (username) => {
    if (username) localStorage.setItem('username', username);
    else localStorage.removeItem('username');
    set({ username });
  },
  login: (token, isAdmin = false, currentUID = '', displayName = '', username = '') => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    if (displayName) localStorage.setItem('displayName', displayName);
    if (username) localStorage.setItem('username', username);
    set({ token, isAdmin, currentUID: currentUID || (isAdmin ? 'player_001' : ''), displayName: displayName || null, username: username || null });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    localStorage.removeItem('username');
    set({ token: null, isAdmin: false, displayName: null, username: null });
  },
}));
