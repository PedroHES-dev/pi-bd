import bcrypt from 'bcrypt';
import { db } from '../../config/db.js';
import jwt from 'jsonwebtoken';
// Função para cadastro de usuário
export const cadastro = async (req, res) => {
    const { nome_usuario, email, senha } = req.body;

    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM usuarios WHERE nome_usuario = ? OR email = ?',
            [nome_usuario, email]
        );

        if (rows.length > 0) {
            return res.status(400).json({ message: 'Nome de usuário ou e-mail já cadastrado' });
        }

        const hashSenha = await bcrypt.hash(senha, 10);

        await db.promise().query(
            'INSERT INTO usuarios (nome_usuario, email, senha, role) VALUES (?, ?, ?, ?)',
            [nome_usuario, email, hashSenha, 'user'] // Atribuindo "user" como padrão, mas pode ser alterado
        );

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
};
