const { z } = require("zod");

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createRotaSchema = z.object({
  name: z.string().trim().min(3, "Nome da rota é obrigatório"),
  origem: z.string().trim().min(1, "Origem é obrigatória"),
  destino: z.string().trim().min(1, "Destino é obrigatório"),
  horarioIda: z.string().regex(horaRegex, "horarioIda deve estar no formato HH:MM"),
  horarioVolta: z.string().regex(horaRegex, "horarioVolta deve estar no formato HH:MM"),
  veiculo: z.string().trim().min(1, "Veículo é obrigatório"),
  capacidade: z.coerce.number().int().positive("capacidade deve ser um número positivo"),
  paradas: z.array(z.string().trim().min(1)).min(1, "Informe ao menos uma parada"),
});

const updateRotaSchema = createRotaSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

module.exports = { createRotaSchema, updateRotaSchema, idParamSchema };
