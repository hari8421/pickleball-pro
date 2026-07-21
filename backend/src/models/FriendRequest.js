const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema(
  {
    senderUID: { type: String, required: true },
    receiverUID: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Compound unique index — prevents duplicate requests at DB level
FriendRequestSchema.index({ senderUID: 1, receiverUID: 1 }, { unique: true });

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
