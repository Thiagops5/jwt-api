const express = require('express');
const router = express.Router();
const readerController = require('./reader.controller');
const authMiddleware = require('../auth/auth.middleware');

// todas exigem usuário logado (admin ou atendente)
router.post('/', authMiddleware.verifyToken, readerController.create);
router.get('/', authMiddleware.verifyToken, readerController.findAll);
router.get('/:id', authMiddleware.verifyToken, readerController.findById);
router.get('/:id/loans', authMiddleware.verifyToken, readerController.findLoans);
router.put('/:id', authMiddleware.verifyToken, readerController.update);
router.delete('/:id', authMiddleware.verifyToken, readerController.delete);

module.exports = router;