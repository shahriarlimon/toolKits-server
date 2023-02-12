const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Enter your password"],
        minlength: [8, "password should at least be 8 characters long"],
        maxlength: 1024
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    /*  avatar: {
         public_id: {
             type: String,
             required: true,
         },
         url: {
             type: String,
             required: true,
         },
     }, */
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
/* comparing password */

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

/* jwt token */
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRE_TIME })
}
module.exports = mongoose.model("User", userSchema)