const repository = require("./notificacoes.repository");
const usuariosRepository = require("../usuarios/usuarios.repository");
const { mapNotificacao } = require("../../utils/serializers");
const AppError = require("../../utils/AppError");

async function list(req, res, next) {
  try {
    // Administrador vê todas as notificações (com quem já leu cada uma).
    // Demais papéis veem apenas as que ainda não leram e são destinadas a eles.
    const rows =
      req.user.role === "administrador"
        ? await repository.findAll()
        : await repository.findUnreadForUser(req.user.id, req.user.role);

    return res.json(rows.map(mapNotificacao));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    let payload = req.body;

    // Motorista só pode avisar os alunos da própria rota: ignoramos qualquer
    // audience/routeId enviado pelo cliente e usamos a rota vinculada a ele.
    if (req.user.role === "motorista") {
      const motorista = await usuariosRepository.findById(req.user.id);
      if (!motorista?.rota_id) {
        throw new AppError("Você não está vinculado a nenhuma rota.", 400);
      }
      payload = {
        ...payload,
        audience: "aluno",
        routeId: motorista.rota_id,
      };
    }

    const notificacao = await repository.create(payload);
    return res.status(201).json(mapNotificacao(notificacao));
  } catch (err) {
    return next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notificacao = await repository.findById(req.params.id);
    if (!notificacao) throw new AppError("Notificação não encontrada.", 404);

    await repository.markAsRead(req.params.id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, markAsRead };
