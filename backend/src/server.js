require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 3000;

const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];
const faltando = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (faltando.length > 0) {
  console.error(`[server] variáveis de ambiente obrigatórias ausentes: ${faltando.join(", ")}`);
  process.exit(1);
}

/**
 * Tenta conectar ao Postgres com algumas tentativas antes de desistir —
 * útil quando a API sobe antes do healthcheck do banco terminar.
 */
async function waitForDatabase(maxAttempts = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      console.log("[server] conexão com o PostgreSQL estabelecida.");
      return;
    } catch (err) {
      console.warn(
        `[server] tentativa ${attempt}/${maxAttempts} de conectar ao banco falhou: ${err.message}`,
      );
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  try {
    await waitForDatabase();
    app.listen(PORT, () => {
      console.log(`[server] Bus Universitário API rodando em http://localhost:${PORT}`);
      console.log(`[server] Documentação Swagger em http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("[server] não foi possível conectar ao banco de dados. Encerrando.", err);
    process.exit(1);
  }
}

start();
