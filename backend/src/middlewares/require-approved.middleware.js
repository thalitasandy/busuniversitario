const AppError = require("../utils/AppError");
const usuariosRepository = require("../modules/usuarios/usuarios.repository");

/**
 * Bloqueia a ação para usuários cujo cadastro ainda não foi aprovado.
 * Use depois de `authenticate` (precisa de `req.user.id`).
 *
 * O login continua permitido para status "pendente"/"rejeitado" (o frontend
 * usa isso para mostrar a tela de "cadastro em análise"), mas ações que
 * dependem de aprovação — confirmar presença, registrar ocorrência — são
 * bloqueadas aqui, no backend, e não apenas escondidas na UI.
 */
async function requireApproved(req, res, next) {
  try {
    const usuario = await usuariosRepository.findById(req.user.id);
    if (!usuario) {
      return next(new AppError("Usuário não encontrado.", 404));
    }
    if (usuario.status !== "aprovado") {
      return next(
        new AppError(
          "Seu cadastro ainda não foi aprovado pelo administrador.",
          403,
        ),
      );
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireApproved;
