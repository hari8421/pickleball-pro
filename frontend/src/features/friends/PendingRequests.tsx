import React from 'react';
import { Check, X } from 'lucide-react';
import type { FriendRequest } from '../../types';
import { useFriendsStore } from '../../store/friendsStore';
import { useToastStore } from '../../store/toastStore';

interface PendingRequestsProps {
  requests: FriendRequest[];
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ requests }) => {
  const { acceptRequest, rejectRequest } = useFriendsStore();
  const addToast = useToastStore((s) => s.addToast);

  if (requests.length === 0) return null;

  return (
    <section aria-label="Pending friend requests">
      <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Pending Requests ({requests.length})
      </h2>
      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {req.senderUID}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">wants to be friends</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  acceptRequest(req.id);
                  addToast('Friend request accepted!', 'success');
                }}
                aria-label={`Accept friend request from ${req.senderUID}`}
                className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => {
                  rejectRequest(req.id);
                  addToast('Request removed', 'info');
                }}
                aria-label={`Reject friend request from ${req.senderUID}`}
                className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingRequests;
