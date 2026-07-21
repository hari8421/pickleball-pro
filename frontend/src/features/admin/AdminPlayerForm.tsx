import React, { useState } from 'react';
import type { Player } from '../../types';

interface AdminPlayerFormProps {
  initialData?: Player;
  onSubmit: (data: Omit<Player, '_id' | 'createdAt'> | Partial<Omit<Player, '_id' | 'createdAt'>>) => Promise<void>;
  onCancel: () => void;
}

const AdminPlayerForm: React.FC<AdminPlayerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    uid: initialData?.uid || '',
    displayName: initialData?.displayName || '',
    avatarURL: initialData?.avatarURL || '',
    rankScore: initialData?.rankScore || 1500,
    gamesPlayed: initialData?.gamesPlayed || 0,
    winRate: initialData?.winRate || 0.5,
    isAdmin: initialData?.isAdmin || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.uid.trim()) {
      newErrors.uid = 'UID is required';
    } else if (formData.uid.trim().length < 2) {
      newErrors.uid = 'UID must be at least 2 characters';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (formData.rankScore < 0 || formData.rankScore > 9999) {
      newErrors.rankScore = 'Rank score must be between 0 and 9999';
    }

    if (formData.winRate < 0 || formData.winRate > 1) {
      newErrors.winRate = 'Win rate must be between 0 and 1';
    }

    if (formData.gamesPlayed < 0) {
      newErrors.gamesPlayed = 'Games played must be 0 or more';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = initialData
        ? {
            displayName: formData.displayName,
            avatarURL: formData.avatarURL,
            rankScore: formData.rankScore,
            gamesPlayed: formData.gamesPlayed,
            winRate: formData.winRate,
            isAdmin: formData.isAdmin,
          }
        : {
            uid: formData.uid,
            displayName: formData.displayName,
            avatarURL: formData.avatarURL,
            rankScore: formData.rankScore,
            gamesPlayed: formData.gamesPlayed,
            winRate: formData.winRate,
            isAdmin: formData.isAdmin,
          };

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* UID Field - disabled when editing */}
      <div>
        <label htmlFor="uid" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          UID {!initialData && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="uid"
          name="uid"
          value={formData.uid}
          onChange={handleChange}
          disabled={!!initialData}
          placeholder="e.g., player-1"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.uid && <p className="mt-1 text-xs text-red-500">{errors.uid}</p>}
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="e.g., John Doe"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
      </div>

      {/* Avatar URL */}
      <div>
        <label htmlFor="avatarURL" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Avatar URL
        </label>
        <input
          type="text"
          id="avatarURL"
          name="avatarURL"
          value={formData.avatarURL}
          onChange={handleChange}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Rank Score */}
      <div>
        <label htmlFor="rankScore" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Rank Score <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="rankScore"
          name="rankScore"
          value={formData.rankScore}
          onChange={handleChange}
          min="0"
          max="9999"
          placeholder="1500"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.rankScore && <p className="mt-1 text-xs text-red-500">{errors.rankScore}</p>}
      </div>

      {/* Games Played */}
      <div>
        <label htmlFor="gamesPlayed" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Games Played <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="gamesPlayed"
          name="gamesPlayed"
          value={formData.gamesPlayed}
          onChange={handleChange}
          min="0"
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.gamesPlayed && <p className="mt-1 text-xs text-red-500">{errors.gamesPlayed}</p>}
      </div>

      {/* Win Rate */}
      <div>
        <label htmlFor="winRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Win Rate (0-1) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="winRate"
          name="winRate"
          value={formData.winRate}
          onChange={handleChange}
          min="0"
          max="1"
          step="0.01"
          placeholder="0.5"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {errors.winRate && <p className="mt-1 text-xs text-red-500">{errors.winRate}</p>}
      </div>

      {/* Admin Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAdmin"
          name="isAdmin"
          checked={formData.isAdmin}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
        />
        <label htmlFor="isAdmin" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
          Make this player an admin
        </label>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Player' : 'Create Player'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminPlayerForm;

