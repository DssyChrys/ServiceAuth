import express from 'express';
import userController from '../Controller/userController.mjs';

const router = express.Router();

router.post('/users', userController.store);
router.post('/users/login', userController.login);
router.get('/users', userController.index);
router.put('/users/:UserId', userController.update);
router.delete('/users/:UserId', userController.destroy);


export default router;