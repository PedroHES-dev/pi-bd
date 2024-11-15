import mysql from 'mysql2';

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

  export { db };