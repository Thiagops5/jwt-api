const {Router} = require('express');
const router = Router();

const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');

router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.update);
router.patch('/:id/active', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.toggleActive);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.create);
router.get('/:id', authMiddleware.verifyToken, userController.findById);
router.get('/email/:email', authMiddleware.verifyToken, userController.findByEmail);
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.findAll);

module.exports = router;