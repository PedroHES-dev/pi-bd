import { db } from "../../config/db.js"; // Conexão com o banco de dados

const salesModel = {

  // Obter histórico de vendas
  getSalesHistory: (callback) => {
    const query = `
      SELECT 
        v.id_venda, 
        v.quantidade, 
        v.preco AS total, 
        v.data_venda, 
        p.nome_produto, 
        p.descricao, 
        p.preco AS preco_unitario
      FROM vendas v
      INNER JOIN produtos p ON v.id_produto = p.id_produto
      ORDER BY v.data_venda DESC
    `;
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  },

  // Buscar produto pelo ID
  getProductById: (id_produto, callback) => {
    db.query(
      "SELECT * FROM produtos WHERE id_produto = ?",
      [id_produto],
      (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, results[0]); // Retorna o produto encontrado
      }
    );
  },

  // Atualizar estoque após uma venda
  updateProductStockForSale: (id_produto, quantidade, callback) => {
    db.query(
      "UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id_produto = ? AND quantidade_estoque >= ?",
      [quantidade, id_produto, quantidade],
      (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (results.affectedRows === 0) {
          callback("Estoque insuficiente ou produto não encontrado.", null);
          return;
        }
        callback(null, results);
      }
    );
  },

  // Inserir uma nova venda
  insertSale: (id_produto, quantidade, preco_total, callback) => {
    db.query(
      "INSERT INTO vendas (id_produto, quantidade, preco, data_venda) VALUES (?, ?, ?, NOW())",
      [id_produto, quantidade, preco_total],
      (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, results); // Retorna o resultado da inserção
      }
    );
  },
};

export default salesModel;
