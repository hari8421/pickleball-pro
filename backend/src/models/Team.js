const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
    color: {
      type: String,
      match: /^#[0-9a-fA-F]{6}$/,
      default: '#16a34a',
    },
    ownerUID: {
      type: String,
      required: true,
      index: true,
    },
    members: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length >= 1,
        message: 'A team must have at least one member',
      },
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Team', TeamSchema);
