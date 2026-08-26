const { query } = require("../../config/db");

/**
 * Todas as notificações, com a lista de usuários que já leram cada uma
 * (usado na visão administrativa).
 */
async function findAll() {
  const { rows } = await query(
    `SELECT n.*,
            COALESCE(array_agg(nl.usuario_id) FILTER (WHERE nl.usuario_id IS NOT NULL), '{}') AS read_by
     FROM notificacoes n
     LEFT JOIN notificacoes_lidas nl ON nl.notificacao_id = n.id
     GROUP BY n.id
     ORDER BY n.created_at DESC`,
  );
  return rows;
}

/**
 * Notificações destinadas ao papel do usuário (ou a "todos") que ele
 * ainda não marcou como lida — replica o comportamento do mock, em que
 * a notificação "some" da tela assim que o usuário a visualiza.
 */
async function findUnreadForUser(userId, role) {
  const { rows } = await query(
    `SELECT n.*
     FROM notificacoes n
     WHERE (n.audience = 'todos' OR n.audience = $2)
       AND NOT EXISTS (
         SELECT 1 FROM notificacoes_lidas nl
         WHERE nl.notificacao_id = n.id AND nl.usuario_id = $1
       )
     ORDER BY n.created_at DESC`,
    [userId, role],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM notificacoes WHERE id = $1", [id]);
  return rows[0] || null;
}

async function create({ audience, routeId, title, message }) {
  const { rows } = await query(
    `INSERT INTO notificacoes (audience, rota_id, title, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [audience, routeId || null, title, message],
  );
  return rows[0];
}

async function markAsRead(notificacaoId, userId) {
  await query(
    `INSERT INTO notificacoes_lidas (notificacao_id, usuario_id)
     VALUES ($1, $2)
     ON CONFLICT (notificacao_id, usuario_id) DO NOTHING`,
    [notificacaoId, userId],
  );
}

module.exports = { findAll, findUnreadForUser, findById, create, markAsRead };
