const {Router} = require('express');
const router = Router();

const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');

router.post('/', userController.create);
router.get('/:id', authMiddleware.verifyToken, userController.findById);
router.get('/email/:email', authMiddleware.verifyToken, userController.findByEmail);
router.get('/', authMiddleware.verifyToken, userController.findAll);

module.exports = router;