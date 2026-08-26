const { query } = require("../../config/db");

async function findAll({ routeId, date, studentId } = {}) {
  const conditions = [];
  const params = [];

  if (routeId) {
    params.push(routeId);
    conditions.push(`rota_id = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`data = $${params.length}`);
  }
  if (studentId) {
    params.push(studentId);
    conditions.push(`aluno_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT * FROM confirmacoes ${where} ORDER BY data DESC`,
    params,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM confirmacoes WHERE id = $1", [id]);
  return rows[0] || null;
}

/**
 * Cria a confirmação do aluno para a data informada. Se o aluno já tiver
 * confirmado presença nessa mesma data, atualiza a rota/sentido (upsert),
 * já que só existe uma confirmação por aluno por dia.
 */
async function upsert({ studentId, routeId, date, sentido }) {
  const { rows } = await query(
    `INSERT INTO confirmacoes (aluno_id, rota_id, data, sentido)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (aluno_id, data)
     DO UPDATE SET rota_id = EXCLUDED.rota_id, sentido = EXCLUDED.sentido
     RETURNING *`,
    [studentId, routeId, date, sentido],
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await query("DELETE FROM confirmacoes WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, upsert, remove };
