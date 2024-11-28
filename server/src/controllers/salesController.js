import salesModel from "../models/salesModel.js";
import qrCodeService from "../services/qrCodeService.js"; // Para processar o QR code

// Função para registrar a venda diretament
const registerSale = (req, res) => {
    const { id_produto, quantidade } = req.body;
  
    if (isNaN(id_produto) || isNaN(quantidade) || quantidade <= 0) {
      return res.status(400).json({ error: 'ID ou quantidade inválidos.' });
    }
  
    // Atualizar o estoque
    salesModel.updateProductStockForSale(id_produto, quantidade, (err, result) => {
      if (err) {
        return res.status(500).json({ error: `Erro ao registrar venda: ${err}` });
      }
      
      // Resposta em formato JSON
      res.json({ message: `Venda do produto ${id_produto} registrada com sucesso.` });
    });
  };
  

// Função para processar QR code e registrar a venda
const processQRCodeForSale = (req, res) => {
    const { qrCodeData } = req.body;
  
    if (!qrCodeData) {
      return res.status(400).json({ error: 'Dados do QR code não fornecidos.' });
    }
  
    const decodedData = qrCodeService.decodeQRCode(qrCodeData);
  
    if (!decodedData || !decodedData.id_produto || !decodedData.quantidade) {
      return res.status(400).json({ error: 'QR code inválido ou dados ausentes.' });
    }
  
    // Chamar a função para registrar a venda e descontar o estoque
    registerSale({ body: decodedData }, res);
  };

export { registerSale, processQRCodeForSale };
