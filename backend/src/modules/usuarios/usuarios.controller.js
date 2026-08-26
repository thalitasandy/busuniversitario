const repository = require("./usuarios.repository");
const { mapUsuario } = require("../../utils/serializers");
const AppError = require("../../utils/AppError");

async function list(req, res, next) {
  try {
    const usuarios = await repository.findAll(req.query);
    return res.json(usuarios.map(mapUsuario));
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const usuario = await repository.findById(req.params.id);
    if (!usuario) throw new AppError("Usuário não encontrado.", 404);
    return res.json(mapUsuario(usuario));
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const existente = await repository.findById(req.params.id);
    if (!existente) throw new AppError("Usuário não encontrado.", 404);

    const usuario = await repository.updateStatus(req.params.id, req.body.status);
    return res.json(mapUsuario(usuario));
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, updateStatus };
