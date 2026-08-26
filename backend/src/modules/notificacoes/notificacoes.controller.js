const repository = require("./notificacoes.repository");
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
    const notificacao = await repository.create(req.body);
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
