import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { useFriendsStore } from '../../store/friendsStore';
import { useSessionStore } from '../../store/sessionStore';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PendingRequests from './PendingRequests';
import SendRequestForm from './SendRequestForm';
import { useEffect } from 'react';

const FriendsPage: React.FC = () => {
  const currentUID = useSessionStore((s) => s.currentUID);
  const requests = useFriendsStore((s) => s.requests);
  const loadRequests = useFriendsStore((s) => s.loadRequests);

  const { data: players = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: getPlayers,
  });

  // Load friend requests for the current user from the backend when mounted
  useEffect(() => {
    if (currentUID) {
      loadRequests(currentUID).catch((err) => {
        // ignore here; UI components show toasts on actions
        console.error('Failed to load friend requests', err);
      });
    }
  }, [currentUID, loadRequests]);

  const acceptedFriends = requests.filter(
    (r) =>
      r.status === 'accepted' &&
      (r.senderUID === currentUID || r.receiverUID === currentUID)
  );

  const pendingIncoming = requests.filter(
    (r) => r.status === 'pending' && r.receiverUID === currentUID
  );

  const getFriendUID = (r: (typeof requests)[0]) =>
    r.senderUID === currentUID ? r.receiverUID : r.senderUID;

  const getFriendPlayer = (uid: string) => players.find((p) => p.uid === uid);

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Friends</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Playing as <span className="font-medium text-brand-600 dark:text-brand-400">{currentUID}</span>
        </p>
      </div>

      {/* Send request form */}
      {isLoading ? (
        <SkeletonLoader variant="list-item" count={1} />
      ) : (
        <SendRequestForm players={players} currentUID={currentUID} />
      )}

      {/* Pending incoming */}
      <PendingRequests requests={pendingIncoming} />

      {/* Accepted friends */}
      <section aria-label="Friends list">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Friends ({acceptedFriends.length})
        </h2>
        {acceptedFriends.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No friends yet"
            description="Send a friend request using a player's UID to get started."
          />
        ) : (
          <div className="space-y-2">
            {acceptedFriends.map((req) => {
              const friendUID = getFriendUID(req);
              const friend = getFriendPlayer(friendUID);
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                >
                  <Avatar
                    src={friend?.avatarURL}
                    name={friend?.displayName ?? friendUID}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {friend?.displayName ?? friendUID}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {friend ? `${friend.rankScore} pts · ${Math.round(friend.winRate * 100)}% WR` : friendUID}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-full">
                    Friend
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendsPage;
