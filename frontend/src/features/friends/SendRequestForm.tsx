import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Player } from '../../types';
import { useFriendsStore } from '../../store/friendsStore';
import { useToastStore } from '../../store/toastStore';

interface SendRequestFormProps {
  players: Player[];
  currentUID: string;
}

const SendRequestForm: React.FC<SendRequestFormProps> = ({ players, currentUID }) => {
  const [inputUID, setInputUID] = useState('');
  const [error, setError] = useState('');
  const { requests, sendRequest } = useFriendsStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = inputUID.trim();
    if (!trimmed) {
      setError('Please enter a player UID.');
      return;
    }
    if (trimmed === currentUID) {
      setError("You can't send a request to yourself.");
      return;
    }

    const playerExists = players.some((p) => p.uid === trimmed);
    if (!playerExists) {
      setError('No player found with that UID.');
      return;
    }

    const alreadyExists = requests.some(
      (r) =>
        (r.senderUID === currentUID && r.receiverUID === trimmed) ||
        (r.senderUID === trimmed && r.receiverUID === currentUID)
    );
    if (alreadyExists) {
      setError('A friend request already exists between you and this player.');
      return;
    }

    try {
      await sendRequest(currentUID, trimmed);
      addToast('Friend request sent!', 'success');
      setInputUID('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send friend request';
      setError(message);
      addToast(message, 'error');
    }
  };

  return (
    <section aria-label="Send friend request">
      <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Add Friend
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="friend-uid" className="sr-only">
            Enter player UID
          </label>
          <input
            id="friend-uid"
            type="text"
            value={inputUID}
            onChange={(e) => setInputUID(e.target.value)}
            placeholder="Enter player UID..."
            aria-label="Player UID to send request to"
            aria-describedby={error ? 'friend-uid-error' : undefined}
            aria-invalid={!!error}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-colors ${
              error
                ? 'border-red-400 dark:border-red-600'
                : 'border-slate-200 dark:border-slate-700 focus:border-brand-400 dark:focus:border-brand-600'
            }`}
          />
          {error && (
            <p id="friend-uid-error" role="alert" className="mt-1 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Send Request
        </button>
      </form>
    </section>
  );
};

export default SendRequestForm;
