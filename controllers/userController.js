const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("../utils/cloudinary");
const { sendToken } = require("../utils/sendToken");

exports.login = catchAsyncErrors(async (req, res, next) => {

})

exports.register = catchAsyncErrors(async (req, res, next) => {
    /*  const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
         folder: "tools-avatars",
         width: 150,
         crop: "scale",
     }); */
    const { name, email, password } = req.body;
    const user = await User.findOne({ email })
    if (user) return next(new ErrorHandler("User with that email already exist", 404))
    const newUser = await User.create({
        name, email, password, /* avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        } */
    })
    sendToken(newUser, 201, res)
})