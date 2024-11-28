import express from "express";
import { registerSale, processQRCodeForSale } from "../controllers/salesController.js";

// Criando a instância do roteador com um nome mais descritivo
const salesRoutes = express.Router();

// Rota para registrar uma venda e descontar do estoque
salesRoutes.post("/vendas/registrar", registerSale);

// Rota para processar o QR code e registrar a venda
salesRoutes.post("/vendas/qr-code", processQRCodeForSale);

// Exportando o roteador com o novo nome
export default salesRoutes;
