const repository = require("./rotas.repository");
const { mapRota } = require("../../utils/serializers");
const AppError = require("../../utils/AppError");

async function list(req, res, next) {
  try {
    const rotas = await repository.findAll();
    return res.json(rotas.map(mapRota));
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const rota = await repository.findById(req.params.id);
    if (!rota) throw new AppError("Rota não encontrada.", 404);
    return res.json(mapRota(rota));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const rota = await repository.create(req.body);
    return res.status(201).json(mapRota(rota));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const existente = await repository.findById(req.params.id);
    if (!existente) throw new AppError("Rota não encontrada.", 404);

    const rota = await repository.update(req.params.id, req.body);
    return res.json(mapRota(rota));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const removida = await repository.remove(req.params.id);
    if (!removida) throw new AppError("Rota não encontrada.", 404);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };
