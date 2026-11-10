const express = require('express');
const router = express.Router();
const loanController = require('./loan.controller');
const authMiddleware = require('../auth/auth.middleware');

router.post('/', loanController.create);
router.get('/', authMiddleware.verifyToken, loanController.findAll);
router.get('/:id', loanController.findById);
router.patch('/:id/return', loanController.returnBook);


module.exports = router;