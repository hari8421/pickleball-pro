import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FriendRequest } from '../types';
import { getFriendRequests, createFriendRequest, updateFriendRequest, deleteFriendRequest } from '../api/friends';

interface FriendsStore {
  requests: FriendRequest[];
  loadRequests: (uid: string) => Promise<void>;
  sendRequest: (senderUID: string, receiverUID: string) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      requests: [],

      loadRequests: async (uid: string) => {
        try {
          const data = await getFriendRequests(uid);
          set({ requests: data });
        } catch (err) {
          // keep existing state on error; callers can show toasts
          console.error('Failed to load friend requests', err);
        }
      },

      sendRequest: async (senderUID, receiverUID) => {
        // Optimistic update: create temporary request and add to state
        const tempRequest: FriendRequest = {
          id: crypto.randomUUID(),
          senderUID,
          receiverUID,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        // Save current state for rollback
        const previousRequests = get().requests;
        set((state) => ({ requests: [...state.requests, tempRequest] }));

        try {
          // Call backend
          const saved = await createFriendRequest(senderUID, receiverUID);
          // Replace temp request with server response
          set((state) => ({
            requests: state.requests.map((r) =>
              r.id === tempRequest.id ? saved : r
            ),
          }));
        } catch (err) {
          // Rollback on error
          set({ requests: previousRequests });
          throw err;
        }
      },

      acceptRequest: async (id) => {
        // Optimistic update: change status immediately
        const previousRequests = get().requests;
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, status: 'accepted' } : r
          ),
        }));

        try {
          // Call backend
          const updated = await updateFriendRequest(id, 'accepted');
          // Replace with server response (in case status or other fields changed)
          set((state) => ({
            requests: state.requests.map((r) => (r.id === id ? updated : r)),
          }));
        } catch (err) {
          // Rollback on error
          set({ requests: previousRequests });
          throw err;
        }
      },

      rejectRequest: async (id) => {
        // Optimistic update: remove immediately
        const previousRequests = get().requests;
        set((state) => ({ requests: state.requests.filter((r) => r.id !== id) }));

        try {
          // Call backend
          await deleteFriendRequest(id);
        } catch (err) {
          // Rollback on error
          set({ requests: previousRequests });
          throw err;
        }
      },
    }),
    { name: 'pb-friends' }
  )
);
