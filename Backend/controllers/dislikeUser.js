const User = require('../schema/UserSchema');

async function dislikeUser(req, res, next) {
    const userId = req.user._id; // Logged-in user's ID
    const dislikedUserId = req.body.dislikedUserId; // The user to dislike

    try {
        // Add the disliked user to the current user's disliked array
        const currentUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { disliked: dislikedUserId } }, // Use $addToSet to avoid duplicates
            { new: true }
        );

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            msg: "User disliked successfully",
            user: currentUser
        });
    } catch (error) {
        next(error);
    }
}

module.exports = dislikeUser;
