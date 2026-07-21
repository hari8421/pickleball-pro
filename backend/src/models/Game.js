const mongoose = require('mongoose');

// Proper nested GeoJSON sub-schema (allows 2dsphere index)
const LocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    players: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 2;
        },
        message: 'A game must have at least 2 players',
      },
    },
    location: {
      type: LocationSchema,
      required: true,
      index: '2dsphere',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    score: {
      homeTeam: { type: Number, default: 0 },
      awayTeam: { type: Number, default: 0 },
    },
    mediaURL: { type: String },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Game', GameSchema);
