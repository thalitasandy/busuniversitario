const { query } = require("../../config/db");

async function findAll({ routeId, driverId, date } = {}) {
  const conditions = [];
  const params = [];

  if (routeId) {
    params.push(routeId);
    conditions.push(`rota_id = $${params.length}`);
  }
  if (driverId) {
    params.push(driverId);
    conditions.push(`motorista_id = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`data = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT * FROM ocorrencias ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

async function create({ driverId, routeId, date, tipo, mensagem }) {
  const { rows } = await query(
    `INSERT INTO ocorrencias (motorista_id, rota_id, data, tipo, mensagem)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [driverId, routeId, date, tipo, mensagem || null],
  );
  return rows[0];
}

module.exports = { findAll, create };
