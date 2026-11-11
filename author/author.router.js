const express = require('express');
const router = express.Router();
const authorController = require('./author.controller');
const authMiddleware = require('../auth/auth.middleware');

// Mapeamento das rotas (leitura: logado | escrita: somente admin)
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, authorController.create);
router.get('/', authMiddleware.verifyToken, authorController.findAll);
router.get('/:id', authMiddleware.verifyToken, authorController.findById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, authorController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, authorController.delete);

module.exports = router;