const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarURL: { type: String },
    rankScore: { type: Number, default: 1500 },
    gamesPlayed: { type: Number, default: 0 },
    winRate: { type: Number, default: 0.5 },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,       // adds createdAt + updatedAt automatically
    toJSON: { virtuals: true },
  }
);

// Index for leaderboard queries
PlayerSchema.index({ rankScore: -1 });

module.exports = mongoose.model('Player', PlayerSchema);
