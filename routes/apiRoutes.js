const express = require('express');
const app = express();
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes.js")
const errorMiddleware = require("../middlewares/error")
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

app.use("/user", userRoutes)
app.use("/products", productRoutes)
app.use(errorMiddleware)

module.exports = app