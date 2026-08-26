const { z } = require("zod");

const createNotificacaoSchema = z.object({
  audience: z.enum(["todos", "aluno", "motorista", "administrador"]),
  routeId: z.string().uuid("routeId deve ser um UUID válido").optional(),
  title: z.string().trim().min(1, "title é obrigatório"),
  message: z.string().trim().min(1, "message é obrigatório"),
});

const idParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

module.exports = { createNotificacaoSchema, idParamSchema };
