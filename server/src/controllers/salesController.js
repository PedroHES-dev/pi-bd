import salesModel from "../models/salesModel.js";

// Função para registrar a venda diretamente
const registerSale = (req, res) => {
  const { id_produto, quantidade } = req.body;

  if (isNaN(id_produto) || isNaN(quantidade) || quantidade <= 0) {
    return res.status(400).json({ error: "ID ou quantidade inválidos." });
  }

  // Verificar produto e atualizar estoque
  salesModel.getProductById(id_produto, (err, produto) => {
    if (err) {
      return res.status(500).json({ error: `Erro ao buscar produto: ${err}` });
    }

    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    if (produto.quantidade_estoque < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente." });
    }

    // Calcular preço total
    const precoTotal = produto.preco * quantidade;

    // Atualizar estoque
    salesModel.updateProductStockForSale(id_produto, quantidade, (err) => {
      if (err) {
        return res.status(500).json({ error: `Erro ao atualizar estoque: ${err}` });
      }

      // Registrar venda
      salesModel.insertSale(id_produto, quantidade, precoTotal, (err, results) => {
        if (err) {
          return res.status(500).json({ error: `Erro ao registrar venda: ${err}` });
        }

        // Responder com sucesso
        res.status(201).json({
          message: "Venda registrada com sucesso.",
          saleId: results.insertId,
          id_produto,
          quantidade,
          preco_total: precoTotal,
        });

        // Opcional: Atualiza o histórico após a venda ser registrada (se necessário)
        getSalesHistory(req, res); // Chama a função para retornar o histórico atualizado
      });
    });
  });
};

// Função para carregar o histórico de vendas
const getSalesHistory = (req, res) => {
  salesModel.getSalesHistory((err, salesHistory) => {
    if (err) {
      return res.status(500).json({ error: `Erro ao carregar histórico: ${err}` });
    }
    res.status(200).json({ salesHistory });
  });
};

export { registerSale, getSalesHistory };
