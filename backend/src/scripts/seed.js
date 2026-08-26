/**
 * Aplica manualmente o schema e o seed do banco de dados.
 * Útil em ambientes sem Docker, ou para resetar os dados de exemplo
 * durante o desenvolvimento local.
 *
 * Uso: npm run db:seed
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

const ARQUIVOS = ["../../db/init/01_schema.sql", "../../db/init/02_seed.sql"];

async function run() {
  const client = await pool.connect();
  try {
    for (const arquivoRelativo of ARQUIVOS) {
      const caminho = path.join(__dirname, arquivoRelativo);
      const sql = fs.readFileSync(caminho, "utf8");
      console.log(`[seed] executando ${path.basename(caminho)}...`);
      await client.query(sql);
    }
    console.log("[seed] concluído com sucesso.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("[seed] falhou:", err);
  process.exit(1);
});
