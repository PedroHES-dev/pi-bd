import express from 'express';
import { cadastro } from '../controllers/userController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const userRouter = express.Router();

// Rota para cadastrar usuário (apenas admins podem cadastrar)
userRouter.post('/cadastro', verifyToken, verifyAdmin, cadastro);

export { userRouter };
