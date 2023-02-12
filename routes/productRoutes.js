const express = require('express');
const { createTool, getProducts } = require('../controllers/productController');
const router = express.Router()
router.post('/create', createTool)
router.get("/", getProducts)


module.exports = router;