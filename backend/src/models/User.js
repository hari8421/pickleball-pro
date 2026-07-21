const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    playingLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('User', UserSchema);

