const FriendRequest = require('../models/FriendRequest');

/**
 * Normalize Mongoose document to API response (convert _id to id)
 */
function normalizeFriendRequest(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id,
  };
}

/**
 * GET /api/friends
 * Query param: uid — returns all requests where senderUID or receiverUID equals uid.
 */
async function getFriendRequests(req, res, next) {
  try {
    const requestedUID = req.query.uid || req.auth?.username;
    const filter = req.auth?.adminId
      ? (requestedUID ? { $or: [{ senderUID: requestedUID }, { receiverUID: requestedUID }] } : {})
      : { $or: [{ senderUID: req.auth?.username }, { receiverUID: req.auth?.username }] };

    const requests = await FriendRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests.map(normalizeFriendRequest));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/friends
 * Checks for an existing request in either direction (409 if duplicate).
 * Returns 201 on success.
 */
async function createFriendRequest(req, res, next) {
  try {
    const { senderUID, receiverUID } = req.body;
    if (!req.auth?.adminId && senderUID !== req.auth?.username) {
      const error = new Error('You can only send friend requests for your own account');
      error.status = 403;
      return next(error);
    }

    // Check for existing request in either direction
    const existing = await FriendRequest.findOne({
      $or: [
        { senderUID, receiverUID },
        { senderUID: receiverUID, receiverUID: senderUID },
      ],
    });

    if (existing) {
      const err = new Error('A friend request between these users already exists');
      err.status = 409;
      return next(err);
    }

    const request = new FriendRequest({ senderUID, receiverUID });
    const saved = await request.save();
    res.status(201).json(normalizeFriendRequest(saved));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/friends/:id
 * Only allows updating status to 'accepted'.
 * Returns 404 if not found.
 */
async function updateFriendRequest(req, res, next) {
  try {
    const existing = await FriendRequest.findById(req.params.id);
    if (!existing) {
      const err = new Error('Friend request not found');
      err.status = 404;
      return next(err);
    }
    if (!req.auth?.adminId && existing.receiverUID !== req.auth?.username) {
      const err = new Error('Only the receiving player can accept a friend request');
      err.status = 403;
      return next(err);
    }

    const request = await FriendRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );

    if (!request) {
      const err = new Error('Friend request not found');
      err.status = 404;
      return next(err);
    }

    res.json(normalizeFriendRequest(request));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/friends/:id
 * Returns 404 if not found, 204 on success.
 */
async function deleteFriendRequest(req, res, next) {
  try {
    const request = await FriendRequest.findById(req.params.id);
    if (!request) {
      const err = new Error('Friend request not found');
      err.status = 404;
      return next(err);
    }
    const isParticipant = request.senderUID === req.auth?.username || request.receiverUID === req.auth?.username;
    if (!req.auth?.adminId && !isParticipant) {
      const err = new Error('You do not have permission to remove this friend request');
      err.status = 403;
      return next(err);
    }
    await request.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFriendRequests,
  createFriendRequest,
  updateFriendRequest,
  deleteFriendRequest,
};
