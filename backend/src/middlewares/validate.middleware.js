const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

/**
 * Valida `req[source]` (body, query ou params) contra um schema Zod.
 * Em caso de sucesso, substitui `req[source]` pelo dado já validado/tipado.
 *
 * @param {import("zod").ZodTypeAny} schema
 * @param {"body"|"query"|"params"} [source="body"]
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        }));
        return next(new AppError("Dados inválidos na requisição.", 400, details));
      }
      return next(err);
    }
  };
}

module.exports = validate;
