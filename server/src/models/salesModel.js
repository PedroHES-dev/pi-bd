// src/models/salesModel.js
import { db } from "../../config/db.js"; // A conexão com o banco de dados

const salesModel = {
  // Função para buscar um produto pelo ID
  getProductById: (id_produto, callback) => {
    db.query("SELECT * FROM produtos WHERE id_produto = ?", [id_produto], (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results[0]); // Retorna o produto encontrado
    });
  },

  // Função para atualizar o estoque após uma venda
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
};

export default salesModel;
