const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre('save', async function (next) {
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
AdminSchema.methods.comparePassword = async function (inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Admin', AdminSchema);

