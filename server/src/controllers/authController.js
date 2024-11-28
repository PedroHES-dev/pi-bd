import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';

const SECRET_KEY = 'seusegredoaqui';

// Função para login
export const login = async (req, res) => {
    const { nome_usuario, senha } = req.body;

    if (!nome_usuario || !senha) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const query = 'SELECT * FROM usuarios WHERE nome_usuario = ?';
        db.query(query, [nome_usuario], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao consultar o banco de dados.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(senha, user.senha);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciais inválidas.' });
            }

            // Gerar token JWT com o papel do usuário
            const token = jwt.sign(
                { id_usuario: user.id_usuario, nome_usuario: user.nome_usuario, role: user.role },
                SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token, // Retornar o token
                usuario: {
                    nome_usuario: user.nome_usuario,
                    role: user.role,
                },
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
