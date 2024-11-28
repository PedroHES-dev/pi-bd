import jwt from 'jsonwebtoken';

const SECRET_KEY = 'seusegredoaqui';

// Middleware para verificar se o usuário está autenticado (token)
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Recupera o token do header

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);  // Verifica o token
        req.user = decoded;  // Adiciona os dados do usuário à requisição
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para verificar se o usuário é admin
const verifyAdmin = (req, res, next) => {
    const { role } = req.user;

    if (role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    next();
};

export { verifyToken, verifyAdmin };
