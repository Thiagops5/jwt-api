const express = require('express');
const router = express.Router();
const readerController = require('./reader.controller');

router.post('/', readerController.create);
router.get('/', readerController.findAll);
router.get('/:id', readerController.findById);
router.put('/:id', readerController.update);
router.delete('/:id', readerController.delete);

module.exports = router;