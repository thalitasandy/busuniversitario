const { Router } = require("express");

const controller = require("./confirmacoes.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const requireApproved = require("../../middlewares/require-approved.middleware");
const { confirmarSchema, listQuerySchema, idParamSchema } = require("./confirmacoes.validation");

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /confirmacoes:
 *   get:
 *     tags: [Confirmações]
 *     summary: Lista confirmações de presença
 *     description: Alunos veem apenas as próprias confirmações. Motoristas e administradores podem filtrar por rota, data ou aluno.
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date, example: "2026-08-26" }
 *       - in: query
 *         name: studentId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de confirmações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Confirmacao' }
 *   post:
 *     tags: [Confirmações]
 *     summary: Confirma presença do aluno autenticado em uma rota/data (apenas aluno)
 *     description: Como só é permitida uma confirmação por aluno por dia, uma nova chamada para a mesma data substitui a rota/sentido anteriormente confirmados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routeId, date, sentido]
 *             properties:
 *               routeId: { type: string, format: uuid }
 *               date: { type: string, format: date, example: "2026-08-26" }
 *               sentido: { type: string, enum: [ida, volta, ida-volta] }
 *     responses:
 *       201:
 *         description: Confirmação criada/atualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Confirmacao' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", validate(listQuerySchema, "query"), controller.list);
router.post(
  "/",
  authorize("aluno"),
  requireApproved,
  validate(confirmarSchema),
  controller.confirmar,
);

/**
 * @openapi
 * /confirmacoes/{id}:
 *   delete:
 *     tags: [Confirmações]
 *     summary: Cancela uma confirmação de presença
 *     description: Alunos só podem cancelar as próprias confirmações.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Confirmação cancelada
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: Confirmação não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.delete(
  "/:id",
  authorize("aluno", "administrador"),
  validate(idParamSchema, "params"),
  controller.remove,
);

module.exports = router;
