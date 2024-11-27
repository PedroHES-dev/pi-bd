import { Router } from "express";
import { db } from "../../config/db.js";  // Conexão com o banco de dados


const router = Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint para o cadastro de usuário
router.post('/signup', (req, res) => {
  const { nome_usuario, email, senha } = req.body;
  const hashedPassword = bcrypt.hashSync(senha, 10); // Criptografando a senha

  const query = 'INSERT INTO usuarios (nome_usuario, email, senha) VALUES (?, ?, ?)';
  db.query(query, [nome_usuario, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao cadastrar usuário');
    }
    res.send('Usuário cadastrado com sucesso!');
  });
});

// Endpoint para o login de usuário
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar usuário');
    }
    
    if (results.length === 0) {
      return res.status(400).send('Usuário não encontrado');
    }

    const user = results[0];

    // Comparando a senha fornecida com a senha criptografada no banco
    if (!bcrypt.compareSync(senha, user.senha)) {
      return res.status(400).send('Senha incorreta');
    }

    res.send('Login bem-sucedido!');
  });
});