const repository = require("./confirmacoes.repository");
const { mapConfirmacao } = require("../../utils/serializers");
const AppError = require("../../utils/AppError");

async function list(req, res, next) {
  try {
    const filtros = { ...req.query };

    // Alunos só podem ver as próprias confirmações
    if (req.user.role === "aluno") {
      filtros.studentId = req.user.id;
    }

    const confirmacoes = await repository.findAll(filtros);
    return res.json(confirmacoes.map(mapConfirmacao));
  } catch (err) {
    return next(err);
  }
}

async function confirmar(req, res, next) {
  try {
    const confirmacao = await repository.upsert({
      studentId: req.user.id,
      routeId: req.body.routeId,
      date: req.body.date,
      sentido: req.body.sentido,
    });
    return res.status(201).json(mapConfirmacao(confirmacao));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existente = await repository.findById(req.params.id);
    if (!existente) throw new AppError("Confirmação não encontrada.", 404);

    if (req.user.role === "aluno" && existente.aluno_id !== req.user.id) {
      throw new AppError("Você só pode cancelar suas próprias confirmações.", 403);
    }

    await repository.remove(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, confirmar, remove };
