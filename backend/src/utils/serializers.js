/**
 * Estas funções convertem as linhas vindas do PostgreSQL (snake_case)
 * para o formato camelCase já usado pelos tipos do frontend em
 * `lib/store.tsx`, facilitando a integração direta com a interface Next.js.
 * Nunca expor `password_hash` em nenhuma resposta da API.
 */

function trimTime(time) {
  // pg devolve TIME como "17:00:00" — encurtamos para "17:00"
  return typeof time === "string" ? time.slice(0, 5) : time;
}

function mapUsuario(row) {
  const base = {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
  };

  if (row.role === "aluno") {
    return {
      ...base,
      matricula: row.matricula,
      curso: row.curso,
      instituicao: row.instituicao,
      routeId: row.rota_id,
    };
  }

  if (row.role === "motorista") {
    return {
      ...base,
      cnh: row.cnh,
      veiculo: row.veiculo,
      routeId: row.rota_id,
    };
  }

  // administrador
  return {
    ...base,
    instituicao: row.instituicao,
  };
}

function mapRota(row) {
  return {
    id: row.id,
    name: row.name,
    origem: row.origem,
    destino: row.destino,
    horarioIda: trimTime(row.horario_ida),
    horarioVolta: trimTime(row.horario_volta),
    veiculo: row.veiculo,
    capacidade: row.capacidade,
    paradas: row.paradas || [],
  };
}

function mapConfirmacao(row) {
  return {
    id: row.id,
    studentId: row.aluno_id,
    routeId: row.rota_id,
    date: row.data,
    sentido: row.sentido,
  };
}

function mapOcorrencia(row) {
  return {
    id: row.id,
    driverId: row.motorista_id,
    routeId: row.rota_id,
    date: row.data,
    tipo: row.tipo,
    mensagem: row.mensagem,
  };
}

function mapNotificacao(row) {
  return {
    id: row.id,
    audience: row.audience,
    routeId: row.rota_id || undefined,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    readBy: row.read_by || [],
  };
}

module.exports = {
  mapUsuario,
  mapRota,
  mapConfirmacao,
  mapOcorrencia,
  mapNotificacao,
};
