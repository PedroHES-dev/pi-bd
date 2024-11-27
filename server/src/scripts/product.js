import { Router } from "express";
import multer from "multer";
import path from "path";
import { db } from "../../config/db.js";  // Conexão com o banco de dados
import { fileURLToPath } from 'url';

// Resolver o diretório atual com import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Caminho correto para o diretório de uploads, agora em 'server/uploads'
const uploadsDir = path.resolve(__dirname, '..', '..', '..', 'uploads');  // Caminho absoluto para uploads dentro de 'server'

// Configuração do multer para salvar imagens no diretório 'uploads'
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Verifique se o diretório de uploads existe, caso contrário, passe o caminho correto
      cb(null, uploadsDir);  // Caminho correto para os uploads
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);  // Obtém a extensão do arquivo
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Apenas arquivos de imagem são permitidos."));
    }
    cb(null, true);
  },
});

// Rota para upload de produto com imagem
router.post("/produtos", upload.single("imagem"), (req, res) => {
  const { nome_produto, descricao, preco, quantidade_estoque, id_fornecedor } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nome_produto || !descricao || !preco || !quantidade_estoque || !id_fornecedor) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  if (!imagem) {
    return res.status(400).send("É necessário enviar uma imagem do produto.");
  }

  db.query("SELECT * FROM fornecedores WHERE id_fornecedor = ?", [id_fornecedor], (err, results) => {
    if (err) {
      console.error("Erro ao verificar fornecedor:", err);
      return res.status(500).send("Erro no servidor.");
    }

    if (results.length === 0) {
      return res.status(404).send("Fornecedor não encontrado.");
    }

    db.query(
      "INSERT INTO produtos (nome_produto, descricao, preco, quantidade_estoque, id_fornecedor, imagem) VALUES (?, ?, ?, ?, ?, ?)",
      [nome_produto, descricao, parseFloat(preco), parseInt(quantidade_estoque, 10), id_fornecedor, imagem],
      (err) => {
        if (err) {
          console.error("Erro ao cadastrar produto:", err);
          return res.status(500).send("Erro ao cadastrar produto.");
        }

        res.status(201).send("Produto cadastrado com sucesso.");
      }
    );
  });
});


router.get('/fornecedores', (req, res) => {
  db.query('SELECT id_fornecedor, nome_fornecedor FROM fornecedores', (err, results) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err);
      return res.status(500).send('Erro no servidor.');
    }
    res.json(results);
  });
});



// Rota para listar ou filtrar produtos
router.get('/produtos', (req, res) => {
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

// Rota para buscar produto por ID
router.get('/produtos/:id', (req, res) => {
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
router.put('/produtos/:id', upload.single("imagem"), (req, res) => {
  const { id } = req.params;
  const { nome_produto, descricao, preco, quantidade_estoque } = req.body;

  // Se uma imagem foi enviada, usar a nova imagem, caso contrário, manter a antiga
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  // Verificação do ID
  if (isNaN(id)) {
    return res.status(400).send('ID inválido fornecido.');
  }

  // Validação dos campos obrigatórios
  if (!nome_produto || !descricao || isNaN(preco) || isNaN(quantidade_estoque)) {
    return res.status(400).send('Campos obrigatórios não podem estar vazios ou inválidos.');
  }

  // Buscar o produto existente
  db.query('SELECT id_categoria, id_fornecedor, imagem FROM produtos WHERE id_produto = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produto para edição:', err);
      return res.status(500).send('Erro no servidor');
    }

    if (results.length === 0) {
      console.log('Produto não encontrado no banco de dados.');
      return res.status(404).send('Produto não encontrado');
    }

    const { id_categoria, id_fornecedor, imagem: imagemAntiga } = results[0];

    // Se uma nova imagem foi enviada, atualizar a imagem. Caso contrário, manter a imagem antiga
    const novaImagem = imagem || imagemAntiga;

    console.log('Nova Imagem:', novaImagem);  // Verificando qual imagem será salva

    // Atualizar os dados do produto no banco
    db.query(
      'UPDATE produtos SET nome_produto = ?, descricao = ?, preco = ?, quantidade_estoque = ?, imagem = ? WHERE id_produto = ?',
      [nome_produto, descricao, parseFloat(preco), quantidade_estoque, novaImagem, id],
      (err, result) => {
        if (err) {
          console.error('Erro ao atualizar produto:', err);
          return res.status(500).send('Erro no servidor');
        }

        if (result.affectedRows === 0) {
          console.log('Nenhuma linha afetada. Produto não foi encontrado.');
          return res.status(404).send('Produto não encontrado');
        }

        console.log('Produto atualizado com sucesso');
        res.send('Produto atualizado com sucesso');
      }
    );
  });
});


// Rota para excluir produto
router.delete('/produtos/:id', (req, res) => {
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

function fecharModal() {
  const modal = document.getElementById('imagemModal');
  if (modal) modal.remove();
}

export { router as productRouter };
