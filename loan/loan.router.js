const express = require('express');
const router = express.Router();
const loanController = require('./loan.controller');
const authMiddleware = require('../auth/auth.middleware');

router.post('/', authMiddleware.verifyToken, loanController.create);
router.get('/', authMiddleware.verifyToken, loanController.findAll);
router.get('/:id', authMiddleware.verifyToken, loanController.findById);
router.patch('/:id/return', authMiddleware.verifyToken, loanController.returnBook);


module.exports = router;