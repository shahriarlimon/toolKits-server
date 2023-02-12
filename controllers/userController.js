const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("../utils/cloudinary");
const { sendToken } = require("../utils/sendToken");

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler("please enter email/password", 400));
    const user = await User.findOne({ email })
    if (!user) return next(new ErrorHandler("Invalid email/password", 401))
    const isPasswordMatched = await user.comparePassword(password)
    if (!isPasswordMatched) return next(new ErrorHandler("Invalid email/password", 401))
    sendToken(user, 201, res)
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

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(201).json({
        success: true,
        message: "Logged out"
    })
})