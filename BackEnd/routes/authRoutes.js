const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册路由
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/getUserInfo', authController.getUserInfo);
module.exports = router;
