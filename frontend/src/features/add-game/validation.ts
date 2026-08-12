import type { AddGameFormFields } from '../../types';

export function validateAddGameForm(
  fields: AddGameFormFields
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (fields.players.length < 2) {
    errors.players = 'Select at least 2 players.';
  }

  if (
    fields.score.homeTeam < 0 ||
    !Number.isInteger(fields.score.homeTeam)
  ) {
    errors.homeTeam = 'Score must be a non-negative integer.';
  }

  if (
    fields.score.awayTeam < 0 ||
    !Number.isInteger(fields.score.awayTeam)
  ) {
    errors.awayTeam = 'Score must be a non-negative integer.';
  }

  if (!fields.location) {
    errors.location = 'Location is required.';
  }

  if (Boolean(fields.homeTeamId) !== Boolean(fields.awayTeamId)) {
    errors.teams = 'Select both a home team and an away team, or leave both blank.';
  }

  return errors;
}
