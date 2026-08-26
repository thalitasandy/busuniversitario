const { z } = require("zod");

const updateStatusSchema = z.object({
  status: z.enum(["aprovado", "rejeitado", "pendente"], {
    errorMap: () => ({ message: "status deve ser 'aprovado', 'rejeitado' ou 'pendente'" }),
  }),
});

const listQuerySchema = z.object({
  role: z.enum(["aluno", "motorista", "administrador"]).optional(),
  status: z.enum(["pendente", "aprovado", "rejeitado"]).optional(),
  instituicao: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

module.exports = { updateStatusSchema, listQuerySchema, idParamSchema };
