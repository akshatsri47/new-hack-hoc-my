const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{type:String , required:true},
    email:{type:String,required:true},
    img:{
        data:Buffer,
        contentType:String
    },
    skills:[String],
    resume:{
        data:Buffer,
        contentType:String
    },
    bio:{type:String,required:true},
    matched:[{type:Schema.Types.ObjectId,ref:'User'}],
    disliked: [{ type: Schema.Types.ObjectId, ref: 'User' }] 
})
module.exports= mongoose.model('User',UserSchema);