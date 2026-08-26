const { z } = require("zod");

const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

const createOcorrenciaSchema = z.object({
  routeId: z.string().uuid("routeId deve ser um UUID válido"),
  date: z.string().regex(dataRegex, "date deve estar no formato YYYY-MM-DD"),
  tipo: z.enum(["atraso", "avaria", "cancelamento", "conclusao", "outro"]),
  mensagem: z.string().trim().max(1000).optional(),
});

const listQuerySchema = z.object({
  routeId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  date: z.string().regex(dataRegex).optional(),
});

module.exports = { createOcorrenciaSchema, listQuerySchema };
