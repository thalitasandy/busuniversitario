const { Router } = require("express");

const controller = require("./notificacoes.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { createNotificacaoSchema, idParamSchema } = require("./notificacoes.validation");

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /notificacoes:
 *   get:
 *     tags: [Notificações]
 *     summary: Lista notificações
 *     description: Administradores veem todas as notificações (com quem já leu cada uma). Alunos e motoristas veem apenas as ainda não lidas destinadas a eles ou a "todos".
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notificacao' }
 *   post:
 *     tags: [Notificações]
 *     summary: Envia uma notificação (apenas administrador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [audience, title, message]
 *             properties:
 *               audience: { type: string, enum: [todos, aluno, motorista, administrador] }
 *               routeId: { type: string, format: uuid, nullable: true }
 *               title: { type: string, example: "Ajuste de horário" }
 *               message: { type: string, example: "A saída de amanhã será às 06:35." }
 *     responses:
 *       201:
 *         description: Notificação criada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Notificacao' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", controller.list);
router.post("/", authorize("administrador"), validate(createNotificacaoSchema), controller.create);

/**
 * @openapi
 * /notificacoes/{id}/lida:
 *   patch:
 *     tags: [Notificações]
 *     summary: Marca uma notificação como lida pelo usuário autenticado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Notificação marcada como lida
 *       404:
 *         description: Notificação não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.patch("/:id/lida", validate(idParamSchema, "params"), controller.markAsRead);

module.exports = router;
