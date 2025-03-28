import express from 'express';
import userController from '../controllers/userController.mjs';

const router = express.Router();

router.post('/users', userController.store);
router.post('/users/login', userController.login);
router.post('/users/forgot-password', userController.forgotPassword);
router.post('/users/reset-password', userController.resetPassword);
router.get('/users', userController.index);
router.put('/users/:UserId', userController.update);
router.delete('/users/:UserId', userController.destroy);


export default router;