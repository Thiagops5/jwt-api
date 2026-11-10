const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');

// Mapeamento das rotas
router.post('/', categoryController.create);
router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;