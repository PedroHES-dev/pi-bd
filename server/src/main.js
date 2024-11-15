import { productRouter } from './scripts/product.js';
import { createdRouter } from './scripts/created.js';
import express from 'express';
import cors from 'cors';


const app = express();
const port = 3000;

// Configuração do middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/api", productRouter);

// Inicialização do servidor
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));