const { Pool, types } = require("pg");

// Por padrão o node-postgres converte colunas DATE em objetos JS Date,
// o que causa bugs de fuso horário (ex.: "2026-08-26" virar 25/08).
// Mantemos a string "YYYY-MM-DD" como o Postgres devolve.
types.setTypeParser(1082, (value) => value); // OID 1082 = DATE

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("[db] erro inesperado no pool de conexões:", err);
});

/**
 * Executa uma query parametrizada no PostgreSQL.
 * @param {string} text - SQL com placeholders ($1, $2, ...)
 * @param {Array<any>} [params]
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Fornece um client dedicado para transações (BEGIN/COMMIT/ROLLBACK).
 * Lembre-se de chamar client.release() ao final.
 */
async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient };
