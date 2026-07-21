const FriendRequest = require('../models/FriendRequest');

/**
 * GET /api/friends
 * Query param: uid — returns all requests where senderUID or receiverUID equals uid.
 */
async function getFriendRequests(req, res, next) {
  try {
    const filter = req.query.uid
      ? { $or: [{ senderUID: req.query.uid }, { receiverUID: req.query.uid }] }
      : {};

    const requests = await FriendRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
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
    res.status(201).json(saved);
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

    res.json(request);
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
    const request = await FriendRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      const err = new Error('Friend request not found');
      err.status = 404;
      return next(err);
    }
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
