var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose"); //passport-local pluggin

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	email: {type: String, unique: true, required: true},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose); //gives all methods and important funtionality to our user model

module.exports = mongoose.model("User",userSchema);