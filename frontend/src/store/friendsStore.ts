import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FriendRequest } from '../types';

interface FriendsStore {
  requests: FriendRequest[];
  sendRequest: (senderUID: string, receiverUID: string) => void;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
}

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      requests: [],

      sendRequest: (senderUID, receiverUID) => {
        const existing = get().requests.find(
          (r) =>
            (r.senderUID === senderUID && r.receiverUID === receiverUID) ||
            (r.senderUID === receiverUID && r.receiverUID === senderUID)
        );
        if (existing) return; // prevent duplicates
        const newRequest: FriendRequest = {
          id: crypto.randomUUID(),
          senderUID,
          receiverUID,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ requests: [...state.requests, newRequest] }));
      },

      acceptRequest: (id) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, status: 'accepted' } : r
          ),
        }));
      },

      rejectRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id),
        }));
      },
    }),
    { name: 'pb-friends' }
  )
);
