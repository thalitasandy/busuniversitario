const repository = require("./ocorrencias.repository");
const { mapOcorrencia } = require("../../utils/serializers");

async function list(req, res, next) {
  try {
    const filtros = { ...req.query };

    // Motoristas só veem as próprias ocorrências por padrão
    if (req.user.role === "motorista" && !filtros.driverId) {
      filtros.driverId = req.user.id;
    }

    const ocorrencias = await repository.findAll(filtros);
    return res.json(ocorrencias.map(mapOcorrencia));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const ocorrencia = await repository.create({
      driverId: req.user.id,
      routeId: req.body.routeId,
      date: req.body.date,
      tipo: req.body.tipo,
      mensagem: req.body.mensagem,
    });
    return res.status(201).json(mapOcorrencia(ocorrencia));
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create };
