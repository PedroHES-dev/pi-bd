const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuração do middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'estoque_loja'
});

db.connect(err => {
  if (err) console.error('Erro ao conectar ao banco de dados: ' + err.stack);
  else console.log('Conectado ao banco de dados');
});

// Rota para listar ou filtrar produtos
app.get('/api/produtos', (req, res) => {
  const { search } = req.query;
  const sqlQuery = search
    ? 'SELECT * FROM produtos WHERE nome_produto LIKE ?'
    : 'SELECT * FROM produtos';
  const params = search ? [`%${search}%`] : [];
  
  db.query(sqlQuery, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).send('Erro no servidor');
    } 
    res.json(results);
  });
});

// Rota para adicionar produto
app.post('/api/produto', (req, res) => {
  const { nome_produto, descricao, preco, quantidade_estoque, id_categoria, id_fornecedor } = req.body;

  // Validação simples
  if (!nome_produto || !descricao || !preco || !quantidade_estoque || !id_categoria || !id_fornecedor) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  db.query(
    'INSERT INTO produtos (nome_produto, descricao, preco, quantidade_estoque, id_categoria, id_fornecedor) VALUES (?, ?, ?, ?, ?, ?)',
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

// Rota para buscar produto por ID
app.get('/api/produto/:id', (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é um número válido
  if (isNaN(id)) {
    return res.status(400).send('ID inválido fornecido.');
  }

  db.query('SELECT * FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produto:', err);
      return res.status(500).send('Erro no servidor');
    }

    // Verificar se o produto foi encontrado
    if (results.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }
    
    res.json(results[0]);
  });
});

// Rota para atualizar produto
app.put('/api/produto/:id', (req, res) => {
  const { id } = req.params;
  const { nome_produto, descricao, preco, quantidade_estoque } = req.body;

  // Verificar se o ID é um número válido
  if (isNaN(id)) {
    return res.status(400).send('ID inválido fornecido.');
  }

  // Validação simples para os campos obrigatórios
  if (!nome_produto || !descricao || isNaN(preco) || isNaN(quantidade_estoque)) {
    return res.status(400).send('Campos obrigatórios não podem estar vazios ou inválidos.');
  }

  // Garantir que o id_fornecedor e id_categoria não sejam alterados
  db.query('SELECT id_categoria, id_fornecedor FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produto para edição:', err);
      return res.status(500).send('Erro no servidor');
    }

    if (results.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }

    const { id_categoria, id_fornecedor } = results[0]; // Pegando os valores atuais de id_categoria e id_fornecedor

    // Atualizando o produto sem alterar id_categoria e id_fornecedor
    db.query(
      'UPDATE produtos SET nome_produto = ?, descricao = ?, preco = ?, quantidade_estoque = ? WHERE id_produto = ?',
      [nome_produto, descricao, parseFloat(preco), quantidade_estoque, id],
      (err, result) => {
        if (err) {
          console.error('Erro ao atualizar produto:', err);
          return res.status(500).send('Erro no servidor');
        }

        if (result.affectedRows === 0) {
          return res.status(404).send('Produto não encontrado');
        }

        res.send('Produto atualizado com sucesso');
      }
    );
  });
});

// Rota para excluir produto
app.delete('/api/produto/:id', (req, res) => {
  const { id } = req.params;

  // Verificar se o ID é válido e um número
  if (!id || isNaN(Number(id))) {
    return res.status(400).send('ID inválido fornecido.');
  }

  db.query('DELETE FROM produtos WHERE id_produto = ?', [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir produto:', err);
      return res.status(500).send('Erro no servidor');
    }

    // Verificar se alguma linha foi afetada (ou seja, se o produto existia)
    if (result.affectedRows === 0) {
      return res.status(404).send('Produto não encontrado.');
    }

    res.send('Produto excluído com sucesso');
  });
});

// Inicialização do servidor
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
