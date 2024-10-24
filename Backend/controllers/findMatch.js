const User = require('../schema/UserSchema')
async function findMatch(req, res, next) {
    const pref = req.body.pref; 
    // Assuming you have access to the logged-in user's ID
    
    try{
   
        // Find users that match the given preference but are not in the disliked list
        const users = await User.find({
            skills: { $in: [pref] }, // Match the skill preference
            _id: { $nin: currentUser.disliked } // Exclude users in the disliked array
        });

    
        if (!users.length) {
            return res.status(404).json({
                success: false,
                msg: "No users match your preference",
            });
        }

        res.json(users);
    } catch (error) {
        next(error);
    }
}


module.exports = findMatch