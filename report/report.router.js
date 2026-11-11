const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const authMiddleware = require('../auth/auth.middleware');

// somente administrador
router.get('/dashboard', authMiddleware.verifyToken, authMiddleware.verifyAdmin, reportController.dashboard);

module.exports = router;
