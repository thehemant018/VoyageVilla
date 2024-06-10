const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
// password(hash and salt also added) and username automatically defined by local-mongoose
const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);