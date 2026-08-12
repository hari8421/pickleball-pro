import { describe, expect, it } from 'vitest';
import { validateAddGameForm } from './validation';

const location = { type: 'Point' as const, coordinates: [-122.4, 37.7] as [number, number] };

const validFields = {
  players: ['player-1', 'player-2'],
  score: { homeTeam: 11, awayTeam: 7 },
  location,
};

describe('validateAddGameForm', () => {
  it('requires two players and a location', () => {
    const errors = validateAddGameForm({
      ...validFields,
      players: ['player-1'],
      location: null,
    });

    expect(errors.players).toBe('Select at least 2 players.');
    expect(errors.location).toBe('Location is required.');
  });

  it('requires both team selections when one team is provided', () => {
    const errors = validateAddGameForm({ ...validFields, homeTeamId: 'home-team' });

    expect(errors.teams).toBe('Select both a home team and an away team, or leave both blank.');
  });

  it('accepts a complete game with two teams', () => {
    expect(validateAddGameForm({
      ...validFields,
      homeTeamId: 'home-team',
      awayTeamId: 'away-team',
    })).toEqual({});
  });
});
