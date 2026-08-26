const { query } = require("../../config/db");

async function findAll() {
  const { rows } = await query("SELECT * FROM rotas ORDER BY name ASC");
  return rows;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM rotas WHERE id = $1", [id]);
  return rows[0] || null;
}

async function create({ name, origem, destino, horarioIda, horarioVolta, veiculo, capacidade, paradas }) {
  const { rows } = await query(
    `INSERT INTO rotas (name, origem, destino, horario_ida, horario_volta, veiculo, capacidade, paradas)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, origem, destino, horarioIda, horarioVolta, veiculo, capacidade, paradas],
  );
  return rows[0];
}

async function update(id, fields) {
  const columnMap = {
    name: "name",
    origem: "origem",
    destino: "destino",
    horarioIda: "horario_ida",
    horarioVolta: "horario_volta",
    veiculo: "veiculo",
    capacidade: "capacidade",
    paradas: "paradas",
  };

  const sets = [];
  const params = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }

  if (sets.length === 0) {
    return findById(id);
  }

  params.push(id);
  const { rows } = await query(
    `UPDATE rotas SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query("DELETE FROM rotas WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
