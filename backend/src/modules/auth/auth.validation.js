const { z } = require("zod");

const baseFields = {
  name: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().trim().email("E-mail inválido").toLowerCase(),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
};

const alunoSchema = z.object({
  role: z.literal("aluno"),
  ...baseFields,
  matricula: z.string().trim().min(1, "Matrícula é obrigatória"),
  curso: z.string().trim().min(1, "Curso é obrigatório"),
  instituicao: z.string().trim().min(1, "Instituição é obrigatória"),
  routeId: z.string().uuid("routeId deve ser um UUID de rota válido"),
});

const motoristaSchema = z.object({
  role: z.literal("motorista"),
  ...baseFields,
  cnh: z.string().trim().min(1, "CNH é obrigatória"),
  veiculo: z.string().trim().min(1, "Veículo é obrigatório"),
  routeId: z.string().uuid("routeId deve ser um UUID de rota válido"),
});

const administradorSchema = z.object({
  role: z.literal("administrador"),
  ...baseFields,
  instituicao: z.string().trim().min(1, "Instituição é obrigatória"),
});

const registerSchema = z.discriminatedUnion("role", [
  alunoSchema,
  motoristaSchema,
  administradorSchema,
]);

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").toLowerCase(),
  password: z.string().min(1, "Senha é obrigatória"),
});

module.exports = { registerSchema, loginSchema };
