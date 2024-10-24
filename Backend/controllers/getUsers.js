const User = require('../schema/UserSchema')
const getUsers =async (req,res,next)=>{
    const user = await User.find();
    res.send(user);
}
module.exports=getUsers