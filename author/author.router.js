const express = require('express');
const router = express.Router();
const authorController = require('./author.controller');

// Mapeamento das rotas
router.post('/', authorController.create);
router.get('/', authorController.findAll);
router.get('/:id', authorController.findById);
router.put('/:id', authorController.update);
router.delete('/:id', authorController.delete);

module.exports = router;