import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, ShieldCheck, Trash2, UsersRound, X } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { createTeam, deleteTeam, getTeams, updateTeam } from '../../api/teams';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import type { Team } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const DEFAULT_COLOR = '#16a34a';

type TeamForm = Pick<Team, 'name' | 'description' | 'color' | 'members'>;

const TeamsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const { currentUID, isAdmin } = useSessionStore();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TeamForm>({
    name: '',
    description: '',
    color: DEFAULT_COLOR,
    members: currentUID ? [currentUID] : [],
  });
  const [formError, setFormError] = useState('');

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: QUERY_KEYS.teams,
    queryFn: getTeams,
  });
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: getPlayers,
  });

  const playerNames = useMemo(
    () => new Map(players.map((player) => [player.uid, player.displayName])),
    [players]
  );

  const refreshTeams = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams });

  const saveMutation = useMutation({
    mutationFn: (payload: TeamForm) =>
      editingTeam ? updateTeam(editingTeam._id, payload) : createTeam(payload),
    onSuccess: () => {
      refreshTeams();
      setShowForm(false);
      setEditingTeam(null);
      setFormError('');
      addToast(editingTeam ? 'Team updated successfully' : 'Team created successfully', 'success');
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      refreshTeams();
      addToast('Team deleted', 'success');
    },
    onError: (error: Error) => addToast(error.message, 'error'),
  });

  const openCreate = () => {
    setEditingTeam(null);
    setForm({ name: '', description: '', color: DEFAULT_COLOR, members: currentUID ? [currentUID] : [] });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({ name: team.name, description: team.description || '', color: team.color, members: team.members });
    setFormError('');
    setShowForm(true);
  };

  const toggleMember = (uid: string) => {
    setForm((previous) => ({
      ...previous,
      members: previous.members.includes(uid)
        ? previous.members.filter((member) => member !== uid)
        : [...previous.members, uid],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError('Team name is required.');
      return;
    }
    if (form.members.length === 0) {
      setFormError('Select at least one player.');
      return;
    }
    saveMutation.mutate({ ...form, name: form.name.trim() });
  };

  const canManage = (team: Team) => isAdmin || team.ownerUID === currentUID;

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Clubhouse</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teams</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Build squads and use them when logging matches.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Create Team
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-200 dark:border-brand-800/50 bg-white dark:bg-slate-800/70 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingTeam ? 'Edit team' : 'Create a team'}</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close team form" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
            <div>
              <label htmlFor="team-name" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Team name</label>
              <input id="team-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Kitchen Line" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
            </div>
            <div>
              <label htmlFor="team-color" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Team color</label>
              <input id="team-color" type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} className="h-11 w-20 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </div>
          </div>

          <div>
            <label htmlFor="team-description" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea id="team-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} maxLength={240} placeholder="What makes this squad click?" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none" />
          </div>

          <fieldset>
            <legend className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Members ({form.members.length})</legend>
            {playersLoading ? <SkeletonLoader variant="list-item" count={2} /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {players.map((player) => {
                  const selected = form.members.includes(player.uid);
                  return (
                    <button key={player.uid} type="button" onClick={() => toggleMember(player.uid)} aria-pressed={selected} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left text-sm transition-colors ${selected ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300'}`}>
                      <span className="truncate">{player.displayName}</span>
                      {selected && <span className="text-xs font-semibold">Added</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>

          {formError && <p role="alert" className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saveMutation.isPending || playersLoading} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold disabled:opacity-50">{saveMutation.isPending ? 'Saving...' : editingTeam ? 'Save changes' : 'Create team'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {teamsLoading ? <SkeletonLoader variant="card" count={3} /> : teams.length === 0 ? (
        <EmptyState icon={UsersRound} title="No teams yet" description="Create your first squad to organize doubles partners and matchups." action={<button type="button" onClick={openCreate} className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold">Create a team</button>} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <article key={team._id} className="rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 overflow-hidden">
              <div className="h-2" style={{ backgroundColor: team.color }} />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">{team.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{team.description || 'No description yet.'}</p>
                  </div>
                  {canManage(team) && <div className="flex gap-1"><button type="button" onClick={() => openEdit(team)} aria-label={`Edit ${team.name}`} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 className="w-4 h-4" /></button><button type="button" onClick={() => { if (window.confirm(`Delete ${team.name}?`)) deleteMutation.mutate(team._id); }} aria-label={`Delete ${team.name}`} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button></div>}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><UsersRound className="w-4 h-4" aria-hidden="true" /> {team.members.length} member{team.members.length === 1 ? '' : 's'} · Owner: {team.ownerUID}</div>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((uid) => <span key={uid} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />{playerNames.get(uid) || uid}</span>)}
                </div>
                {isAdmin && <p className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400"><ShieldCheck className="w-3.5 h-3.5" /> Admin management access</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
