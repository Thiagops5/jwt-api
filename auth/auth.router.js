const { Router } = require('express');
const router = Router();

const authController = require('./auth.controller');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;