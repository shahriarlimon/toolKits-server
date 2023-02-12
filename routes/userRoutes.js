const express = require('express');
const { register, login, logout } = require('../controllers/userController');
const { authenticatedUser } = require('../middlewares/auth');
const router = express.Router()
router.post('/register', register)
router.post("/login", login)
router.get("/logout", authenticatedUser, logout)

module.exports = router;