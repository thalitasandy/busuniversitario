const AppError = require("../utils/AppError");

function notFoundHandler(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Violações de constraint do Postgres (ex.: e-mail duplicado, FK inexistente)
  if (err.code === "23505") {
    return res.status(409).json({ error: "Já existe um registro com esses dados (violação de unicidade)." });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referência inválida: o recurso relacionado não existe." });
  }

  console.error("[erro não tratado]", err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}

module.exports = { notFoundHandler, errorHandler };
