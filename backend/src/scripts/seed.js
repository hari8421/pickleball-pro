require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Game = require('../models/Game');

// ── Seed data ──────────────────────────────────────────────────────────────────

const seedPlayers = [
  { uid: 'player_001', displayName: 'Alex Rivera',    rankScore: 1850, winRate: 0.75, gamesPlayed: 48 },
  { uid: 'player_002', displayName: 'Jordan Chen',    rankScore: 1790, winRate: 0.70, gamesPlayed: 43 },
  { uid: 'player_003', displayName: 'Morgan Patel',   rankScore: 1740, winRate: 0.66, gamesPlayed: 39 },
  { uid: 'player_004', displayName: 'Taylor Brooks',  rankScore: 1700, winRate: 0.62, gamesPlayed: 45 },
  { uid: 'player_005', displayName: 'Casey Nguyen',   rankScore: 1670, winRate: 0.60, gamesPlayed: 35 },
  { uid: 'player_006', displayName: 'Riley Okafor',   rankScore: 1630, winRate: 0.57, gamesPlayed: 30 },
  { uid: 'player_007', displayName: 'Drew Yamamoto',  rankScore: 1590, winRate: 0.53, gamesPlayed: 28 },
  { uid: 'player_008', displayName: 'Skyler Marin',   rankScore: 1540, winRate: 0.49, gamesPlayed: 22 },
  { uid: 'player_009', displayName: 'Avery Santos',   rankScore: 1480, winRate: 0.44, gamesPlayed: 16 },
  { uid: 'player_010', displayName: 'Quinn Delacroix',rankScore: 1400, winRate: 0.40, gamesPlayed: 10 },
];

// San Francisco Bay Area GeoJSON coordinates [longitude, latitude]
const sfBayCoords = [
  [-122.4194, 37.7749], // San Francisco
  [-122.2712, 37.8044], // Oakland
  [-121.8947, 37.3382], // San Jose
  [-122.0308, 37.3688], // Sunnyvale
  [-122.1430, 37.4419], // Palo Alto
  [-122.3321, 37.5630], // Fremont
  [-121.9552, 37.5485], // Hayward
  [-122.4702, 37.8716], // Berkeley
  [-122.2566, 37.5160], // Milpitas
  [-121.7680, 37.6688], // Pleasanton
];

// Spread 20 games over the past 30 days
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const playerUIDs = seedPlayers.map((p) => p.uid);

function randomPair() {
  const shuffled = [...playerUIDs].sort(() => Math.random() - 0.5);
  // Pick 4 random unique players for a doubles game
  return shuffled.slice(0, 4);
}

const seedGames = Array.from({ length: 20 }, (_, i) => ({
  players: randomPair(),
  location: {
    type: 'Point',
    coordinates: sfBayCoords[i % sfBayCoords.length],
  },
  timestamp: daysAgo(i + 1),
  score: {
    homeTeam: Math.floor(Math.random() * 5) + 8,  // 8–12
    awayTeam: Math.floor(Math.random() * 8),        // 0–7
  },
}));

// ── Main ───────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Add it to backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

  // Wipe existing data
  const [deletedPlayers, deletedGames] = await Promise.all([
    Player.deleteMany({}),
    Game.deleteMany({}),
  ]);
  console.log(`Deleted ${deletedPlayers.deletedCount} players and ${deletedGames.deletedCount} games.`);

  // Insert fresh data
  const insertedPlayers = await Player.insertMany(seedPlayers);
  console.log(`Inserted ${insertedPlayers.length} players:`);
  insertedPlayers.forEach((p) => console.log(`  • ${p.displayName} (${p.uid}) — rank ${p.rankScore}`));

  const insertedGames = await Game.insertMany(seedGames);
  console.log(`\nInserted ${insertedGames.length} games.`);

  await mongoose.disconnect();
  console.log('\nSeed complete. MongoDB connection closed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
