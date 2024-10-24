const User = require('../schema/UserSchema');

async function registerUser(req,res,next){
    const userDetails = req.body;
    if(!userDetails){
        res.status(404).json({
            msg:"Invalid Inputs"
        })
    }
    const newUser = new User(userDetails);
    await newUser.save();
    res.status(200).json({
        success:true,
        msg:"Registered Successfully"
    })

}
module.exports=registerUser;