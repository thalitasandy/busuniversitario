/**
 * Erro de aplicação com status HTTP associado.
 * Lançar isso em controllers/services é seguro: o errorMiddleware
 * sabe transformá-lo na resposta JSON correta.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;
