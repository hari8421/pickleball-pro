import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Loader2, PlusCircle, X, Navigation } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { getTeams } from '../../api/teams';
import { createGame } from '../../api/games';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToastStore } from '../../store/toastStore';
import { validateAddGameForm } from './validation';
import type { GeoPoint } from '../../types';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const AddGamePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const { state: geoState, request: requestLocation } = useGeolocation();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [mediaURL, setMediaURL] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: getPlayers,
  });
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: QUERY_KEYS.teams,
    queryFn: getTeams,
  });

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
      addToast('Game logged successfully!', 'success');
      navigate('/games');
    },
    onError: (err: Error) => {
      addToast(err.message ?? 'Failed to log game.', 'error');
    },
  });

  const getLocation = (): GeoPoint | null => {
    if (geoState.status === 'success') {
      return {
        type: 'Point',
        coordinates: [geoState.coords.longitude, geoState.coords.latitude],
      };
    }
    if (manualLat && manualLon) {
      const lat = parseFloat(manualLat);
      const lon = parseFloat(manualLon);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { type: 'Point', coordinates: [lon, lat] };
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fields = {
      players: selectedPlayers,
      score: {
        homeTeam: Number(homeScore),
        awayTeam: Number(awayScore),
      },
      location: getLocation(),
      mediaURL: mediaURL || undefined,
      homeTeamId: homeTeamId || undefined,
      awayTeamId: awayTeamId || undefined,
    };

    const validationErrors = validateAddGameForm(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    mutation.mutate({
      players: fields.players,
      score: fields.score,
      location: fields.location!,
      timestamp: new Date().toISOString(),
      mediaURL: fields.mediaURL,
      homeTeamId: fields.homeTeamId,
      awayTeamId: fields.awayTeamId,
    });
  };

  const togglePlayer = (uid: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(uid) ? prev.filter((p) => p !== uid) : [...prev, uid]
    );
  };

  const handleTeamChange = (side: 'home' | 'away', teamId: string) => {
    if (side === 'home') setHomeTeamId(teamId);
    else setAwayTeamId(teamId);
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log a Game</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Record a new pickleball match
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 glass rounded-2xl p-6 bg-white/60 dark:bg-slate-800/40"
      >
        {/* Player selection */}
        <fieldset>
          <legend className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Players <span className="text-red-400">*</span>
          </legend>
          {loadingPlayers || loadingTeams ? (
            <SkeletonLoader variant="list-item" count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {players.map((p) => {
                const selected = selectedPlayers.includes(p.uid);
                return (
                  <button
                    key={p.uid}
                    type="button"
                    onClick={() => togglePlayer(p.uid)}
                    aria-pressed={selected}
                    aria-label={`${selected ? 'Remove' : 'Add'} ${p.displayName}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-sm transition-all ${
                      selected
                        ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-400 dark:border-brand-600 text-brand-700 dark:text-brand-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300'
                    }`}
                  >
                    <span className="truncate font-medium">{p.displayName}</span>
                    {selected && <X className="w-3.5 h-3.5 flex-shrink-0 ml-auto" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
          {selectedPlayers.length > 0 && (
            <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
              {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
            </p>
          )}
          {errors.players && (
            <p role="alert" className="mt-1 text-xs text-red-500">{errors.players}</p>
          )}
        </fieldset>

        {/* Team association */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="home-team" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Home team <span className="font-normal text-slate-400">(optional)</span></label>
            <select id="home-team" value={homeTeamId} onChange={(event) => handleTeamChange('home', event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100">
              <option value="">No team selected</option>
              {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="away-team" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Away team <span className="font-normal text-slate-400">(optional)</span></label>
            <select id="away-team" value={awayTeamId} onChange={(event) => handleTeamChange('away', event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100">
              <option value="">No team selected</option>
              {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
            </select>
          </div>
        </div>
        {errors.teams && <p role="alert" className="text-xs text-red-500">{errors.teams}</p>}

        {/* Score */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="home-score"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Home Score <span className="text-red-400">*</span>
            </label>
            <input
              id="home-score"
              type="number"
              min="0"
              step="1"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              aria-label="Home team score"
              aria-describedby={errors.homeTeam ? 'home-score-error' : undefined}
              aria-invalid={!!errors.homeTeam}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors ${
                errors.homeTeam
                  ? 'border-red-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-brand-400'
              }`}
            />
            {errors.homeTeam && (
              <p id="home-score-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.homeTeam}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="away-score"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Away Score <span className="text-red-400">*</span>
            </label>
            <input
              id="away-score"
              type="number"
              min="0"
              step="1"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              aria-label="Away team score"
              aria-describedby={errors.awayTeam ? 'away-score-error' : undefined}
              aria-invalid={!!errors.awayTeam}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors ${
                errors.awayTeam
                  ? 'border-red-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-brand-400'
              }`}
            />
            {errors.awayTeam && (
              <p id="away-score-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.awayTeam}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Location <span className="text-red-400">*</span>
          </p>
          <button
            type="button"
            onClick={requestLocation}
            disabled={geoState.status === 'loading'}
            aria-label="Detect my location"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:border-brand-400 transition-colors disabled:opacity-50"
          >
            {geoState.status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="w-4 h-4" aria-hidden="true" />
            )}
            {geoState.status === 'loading' ? 'Detecting...' : 'Detect My Location'}
          </button>

          {geoState.status === 'success' && (
            <p className="mt-2 flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {geoState.coords.latitude.toFixed(5)}, {geoState.coords.longitude.toFixed(5)}
            </p>
          )}

          {geoState.status === 'error' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-red-500">{geoState.message}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="manual-lat" className="sr-only">Latitude</label>
                  <input
                    id="manual-lat"
                    type="number"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="Latitude"
                    aria-label="Manual latitude"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="manual-lon" className="sr-only">Longitude</label>
                  <input
                    id="manual-lon"
                    type="number"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="Longitude"
                    aria-label="Manual longitude"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {errors.location && (
            <p role="alert" className="mt-1 text-xs text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Media URL */}
        <div>
          <label
            htmlFor="media-url"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Media URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="media-url"
            type="url"
            value={mediaURL}
            onChange={(e) => setMediaURL(e.target.value)}
            placeholder="https://..."
            aria-label="Link to game video or audio"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:border-brand-400 transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
            <PlusCircle className="w-5 h-5" aria-hidden="true" />
          )}
          {mutation.isPending ? 'Saving...' : 'Log Game'}
        </button>
      </form>
    </div>
  );
};

export default AddGamePage;
