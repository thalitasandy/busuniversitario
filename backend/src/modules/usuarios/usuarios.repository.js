const { query } = require("../../config/db");

async function findByEmail(email) {
  const { rows } = await query("SELECT * FROM usuarios WHERE email = $1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM usuarios WHERE id = $1", [id]);
  return rows[0] || null;
}

async function create({
  role,
  name,
  email,
  passwordHash,
  matricula = null,
  curso = null,
  instituicao = null,
  cnh = null,
  veiculo = null,
  routeId = null,
}) {
  const { rows } = await query(
    `INSERT INTO usuarios
       (role, name, email, password_hash, status, matricula, curso, instituicao, cnh, veiculo, rota_id)
     VALUES ($1, $2, $3, $4, 'pendente', $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [role, name, email, passwordHash, matricula, curso, instituicao, cnh, veiculo, routeId],
  );
  return rows[0];
}

async function findAll({ role, status, instituicao } = {}) {
  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (instituicao) {
    params.push(`%${instituicao}%`);
    conditions.push(`instituicao ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT * FROM usuarios ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

async function updateStatus(id, status) {
  const { rows } = await query(
    "UPDATE usuarios SET status = $2 WHERE id = $1 RETURNING *",
    [id, status],
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, create, findAll, updateStatus };
