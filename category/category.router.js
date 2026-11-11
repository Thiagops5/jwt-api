const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const authMiddleware = require('../auth/auth.middleware');

// Mapeamento das rotas (leitura: logado | escrita: somente admin)
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, categoryController.create);
router.get('/', authMiddleware.verifyToken, categoryController.findAll);
router.get('/:id', authMiddleware.verifyToken, categoryController.findById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, categoryController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, categoryController.delete);

module.exports = router;