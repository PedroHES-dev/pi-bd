import { Router } from 'express';
import { db } from '../../config/db.js';

const router = Router();

    // Rota para adicionar produto
router.post('/produto', (req, res) => {
    const { nome_produto, descricao, preco, quantidade_estoque, id_categoria, id_fornecedor } = req.body;
  
    // Validação simples
    if (!nome_produto || !descricao || !preco || !quantidade_estoque || !id_categoria || !id_fornecedor) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }
  
    db.query(
      'INSERT INTO produtos (nome_produto, descricao, pcreo, quantidade_estoque, id_categoria, id_fornecedor) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_produto, descricao, preco, quantidade_estoque, id_categoria, id_fornecedor],
      (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar produto:', err);
          return res.status(500).send('Erro no servidor');
        } 
        res.send('Produto cadastrado com sucesso');
      }
    );
  });

  export { router as createdRouter };