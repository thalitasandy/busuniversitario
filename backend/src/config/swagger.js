const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Bus Universitário — API",
      version: "1.0.0",
      description:
        "API REST para o sistema de transporte universitário (Pombal → Patos). " +
        "Gerencia usuários (alunos, motoristas e administradores), rotas, confirmações de presença, " +
        "ocorrências e notificações.",
      contact: {
        name: "Bus Universitário",
      },
    },
    servers: [
      { url: "http://localhost:3000/api", description: "Ambiente local (Docker Compose)" },
    ],
    tags: [
      { name: "Autenticação", description: "Cadastro, login e sessão do usuário" },
      { name: "Usuários", description: "Gestão de usuários e aprovação de cadastros" },
      { name: "Rotas", description: "Rotas de ônibus (origem, destino, horários, capacidade)" },
      { name: "Confirmações", description: "Confirmação de presença dos alunos" },
      { name: "Ocorrências", description: "Relatos dos motoristas durante as viagens" },
      { name: "Notificações", description: "Avisos enviados pela administração" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Erro: {
          type: "object",
          properties: {
            error: { type: "string", example: "Mensagem descrevendo o problema" },
            details: { type: "object", nullable: true },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            role: { type: "string", enum: ["aluno", "motorista", "administrador"] },
            name: { type: "string", example: "Marina Silva" },
            email: { type: "string", format: "email", example: "aluno@pombal.edu.br" },
            status: { type: "string", enum: ["pendente", "aprovado", "rejeitado"] },
            matricula: { type: "string", nullable: true, example: "20231045" },
            curso: { type: "string", nullable: true, example: "Engenharia de Produção" },
            instituicao: { type: "string", nullable: true, example: "UEPB - Campus VII (Patos)" },
            cnh: { type: "string", nullable: true },
            veiculo: { type: "string", nullable: true },
            routeId: { type: "string", format: "uuid", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Rota: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Rota 1 · Pombal → UEPB (Campus VII)" },
            origem: { type: "string", example: "Terminal Rodoviário de Pombal" },
            destino: { type: "string", example: "UEPB - Campus VII, Patos" },
            horarioIda: { type: "string", example: "17:00" },
            horarioVolta: { type: "string", example: "22:00" },
            veiculo: { type: "string", example: "Ônibus 01 - ABC-1D23" },
            capacidade: { type: "integer", example: 46 },
            paradas: { type: "array", items: { type: "string" } },
          },
        },
        Confirmacao: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            routeId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date", example: "2026-08-26" },
            sentido: { type: "string", enum: ["ida", "volta", "ida-volta"] },
          },
        },
        Ocorrencia: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            driverId: { type: "string", format: "uuid" },
            routeId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date" },
            tipo: {
              type: "string",
              enum: ["atraso", "avaria", "cancelamento", "conclusao", "outro"],
            },
            mensagem: { type: "string", nullable: true },
          },
        },
        Notificacao: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            audience: {
              type: "string",
              enum: ["todos", "aluno", "motorista", "administrador"],
            },
            routeId: { type: "string", format: "uuid", nullable: true },
            title: { type: "string" },
            message: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            readBy: { type: "array", items: { type: "string", format: "uuid" } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.js"],
};

module.exports = swaggerJsdoc(options);
