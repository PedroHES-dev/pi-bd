// main.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';  // Usando fs.promises para criar o diretório
import { fileURLToPath } from 'url';  // Importar fileURLToPath para resolver o caminho
import { productRouter } from './scripts/product.js';
import { userRouter } from '../src/routes/userRoutes.js'; // Importa o roteador de usuários
import { authRouter } from '../src/routes/authRoutes.js';
import salesRouter from '../src/routes/salesRoutes.js'; // Rota de vendas

// Resolver o diretório atual com import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho correto para a pasta "uploads" fora da pasta "src" e na pasta "server"
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads'); // Subindo duas pastas para sair de 'src' e 'server'

// Função para garantir que o diretório 'uploads' existe
async function ensureUploadsDirectory() {
  try {
    // Cria a pasta uploads caso não exista
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Diretório uploads criado ou já existe');
  } catch (err) {
    console.error('Erro ao criar diretório uploads:', err);
  }
}

const app = express();
const port = 3000;

// Configuração do middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/api", productRouter);
app.use('/uploads', express.static(uploadsDir));
app.use("/api/usuarios", userRouter);
app.use('/api/auth', authRouter);
app.use("/api", salesRouter); // Rota de vendas

// Garantir que o diretório "uploads" seja criado antes de iniciar o servidor
ensureUploadsDirectory().then(() => {
  // Inicialização do servidor
  app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
});
