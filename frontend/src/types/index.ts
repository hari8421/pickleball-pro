export interface Player {
  _id: string;
  uid: string;
  displayName: string;
  avatarURL?: string;
  rankScore: number;
  gamesPlayed: number;
  winRate: number; // 0.0 – 1.0
  isAdmin?: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  playingLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  color: string;
  ownerUID: string;
  members: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Score {
  homeTeam: number;
  awayTeam: number;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Game {
  _id: string;
  players: string[]; // array of UIDs
  location: GeoPoint;
  timestamp: string;
  score: Score;
  mediaURL?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  createdBy?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderUID: string;
  receiverUID: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export type SortKey = 'rankScore' | 'winRate' | 'gamesPlayed';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AddGameFormFields {
  players: string[];
  score: Score;
  location: GeoPoint | null;
  mediaURL?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}
