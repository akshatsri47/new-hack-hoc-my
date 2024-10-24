// controllers/likeController.js

const User = require('../schema/UserSchema');

const likeUser = (io) => async (req, res) => {
  const { likedUserId, likerId } = req.body;

  try {
    const liker = await User.findById(likerId);
    const likedUser = await User.findById(likedUserId);

    if (!liker || !likedUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Create a room based on likedUserId
    const roomId = `room-${likedUserId}`;

    // Emit a notification to the room that the liked user belongs to
    io.to(roomId).emit('liked', { likerId, msg: `${liker.name} liked you!` });

    res.status(200).json({ success: true, msg: "User liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Error liking user" });
  }
};

module.exports = { likeUser };
