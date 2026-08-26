const { Router } = require("express");

const controller = require("./ocorrencias.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { createOcorrenciaSchema, listQuerySchema } = require("./ocorrencias.validation");

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /ocorrencias:
 *   get:
 *     tags: [Ocorrências]
 *     summary: Lista ocorrências relatadas pelos motoristas
 *     description: Motoristas veem por padrão apenas as próprias ocorrências, a menos que informem `driverId` explicitamente.
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: driverId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de ocorrências
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Ocorrencia' }
 *   post:
 *     tags: [Ocorrências]
 *     summary: Registra uma ocorrência durante a viagem (apenas motorista)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routeId, date, tipo]
 *             properties:
 *               routeId: { type: string, format: uuid }
 *               date: { type: string, format: date, example: "2026-08-26" }
 *               tipo: { type: string, enum: [atraso, avaria, cancelamento, conclusao, outro] }
 *               mensagem: { type: string, example: "Trânsito intenso na BR-230, chegada com 15min de atraso." }
 *     responses:
 *       201:
 *         description: Ocorrência registrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Ocorrencia' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", validate(listQuerySchema, "query"), controller.list);
router.post("/", authorize("motorista"), validate(createOcorrenciaSchema), controller.create);

module.exports = router;
