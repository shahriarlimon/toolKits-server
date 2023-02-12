const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
exports.createTool = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.create(req.body)
    res.status.json({ success: true, product })
})

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find({})
    res.status(200).json({
        success: true,
        products
    })
})

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("product not found", 404))
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        product
    })

})

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) return (new ErrorHandler("product not found", 404))
    await product.remove()
    res.status(200).json({
        success: true
    })
})