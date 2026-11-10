const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');

router.post('/', bookController.create);  
router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);
router.put('/:id', bookController.update);
router.delete('/:id', bookController.delete);

module.exports = router;