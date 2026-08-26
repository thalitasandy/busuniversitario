const { z } = require("zod");

const dataRegex = /^\d{4}-\d{2}-\d{2}$/;

const confirmarSchema = z.object({
  routeId: z.string().uuid("routeId deve ser um UUID válido"),
  date: z.string().regex(dataRegex, "date deve estar no formato YYYY-MM-DD"),
  sentido: z.enum(["ida", "volta", "ida-volta"]),
});

const listQuerySchema = z.object({
  routeId: z.string().uuid().optional(),
  date: z.string().regex(dataRegex).optional(),
  studentId: z.string().uuid().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

module.exports = { confirmarSchema, listQuerySchema, idParamSchema };
