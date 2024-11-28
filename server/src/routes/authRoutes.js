import express from 'express';
import { login } from '../controllers/authController.js';

const authRouter = express.Router();

// Rota de login
authRouter.post('/login', login);

export { authRouter };
