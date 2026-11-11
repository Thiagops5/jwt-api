const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');
const authMiddleware = require('../auth/auth.middleware');

// leitura: logado | escrita: somente admin
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, bookController.create);
router.get('/', authMiddleware.verifyToken, bookController.findAll);
router.get('/:id', authMiddleware.verifyToken, bookController.findById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, bookController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, bookController.delete);

module.exports = router;