import express from "express";
import { registerSale, getSalesHistory } from "../controllers/salesController.js";

const salesRouter = express.Router();

// Rota para registrar uma venda
salesRouter.post("/vendas/registrar", registerSale);

// Rota para obter o histórico de vendas
salesRouter.get("/vendas/historico", getSalesHistory);

export default salesRouter;
