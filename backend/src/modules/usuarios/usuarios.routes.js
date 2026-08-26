const { Router } = require("express");

const controller = require("./usuarios.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { updateStatusSchema, listQuerySchema, idParamSchema } = require("./usuarios.validation");

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuários]
 *     summary: Lista usuários (apenas administrador)
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [aluno, motorista, administrador] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pendente, aprovado, rejeitado] }
 *       - in: query
 *         name: instituicao
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Usuario' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", authorize("administrador"), validate(listQuerySchema, "query"), controller.list);

/**
 * @openapi
 * /usuarios/{id}:
 *   get:
 *     tags: [Usuários]
 *     summary: Busca um usuário pelo id (apenas administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get(
  "/:id",
  authorize("administrador"),
  validate(idParamSchema, "params"),
  controller.getById,
);

/**
 * @openapi
 * /usuarios/{id}/status:
 *   patch:
 *     tags: [Usuários]
 *     summary: Aprova, rejeita ou volta a marcar como pendente o cadastro de um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [aprovado, rejeitado, pendente] }
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.patch(
  "/:id/status",
  authorize("administrador"),
  validate(idParamSchema, "params"),
  validate(updateStatusSchema),
  controller.updateStatus,
);

module.exports = router;
