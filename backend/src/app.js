const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");
const rotasRoutes = require("./modules/rotas/rotas.routes");
const confirmacoesRoutes = require("./modules/confirmacoes/confirmacoes.routes");
const ocorrenciasRoutes = require("./modules/ocorrencias/ocorrencias.routes");
const notificacoesRoutes = require("./modules/notificacoes/notificacoes.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Documentação interativa (Swagger UI) e especificação OpenAPI crua
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Autenticação]
 *     summary: Verifica se a API está de pé
 *     security: []
 *     responses:
 *       200:
 *         description: API funcionando
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/rotas", rotasRoutes);
app.use("/api/confirmacoes", confirmacoesRoutes);
app.use("/api/ocorrencias", ocorrenciasRoutes);
app.use("/api/notificacoes", notificacoesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
