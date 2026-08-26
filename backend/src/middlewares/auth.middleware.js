const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwt");

/**
 * Exige um token JWT válido no header `Authorization: Bearer <token>`.
 * Em caso de sucesso, popula `req.user = { id, role }`.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Token de autenticação ausente ou inválido.", 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return next(new AppError("Token de autenticação expirado ou inválido.", 401));
  }
}

/**
 * Restringe o acesso a papéis específicos. Use sempre depois de `authenticate`.
 * @param  {...("aluno"|"motorista"|"administrador")} roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Não autenticado.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Você não tem permissão para acessar este recurso.", 403));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
