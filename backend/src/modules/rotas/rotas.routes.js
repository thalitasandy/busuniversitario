const { Router } = require("express");

const controller = require("./rotas.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate, authorize } = require("../../middlewares/auth.middleware");
const { createRotaSchema, updateRotaSchema, idParamSchema } = require("./rotas.validation");

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /rotas:
 *   get:
 *     tags: [Rotas]
 *     summary: Lista todas as rotas de ônibus
 *     responses:
 *       200:
 *         description: Lista de rotas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Rota' }
 *   post:
 *     tags: [Rotas]
 *     summary: Cria uma nova rota (apenas administrador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, origem, destino, horarioIda, horarioVolta, veiculo, capacidade, paradas]
 *             properties:
 *               name: { type: string, example: "Rota 4 · Pombal → UFPB" }
 *               origem: { type: string }
 *               destino: { type: string }
 *               horarioIda: { type: string, example: "17:00" }
 *               horarioVolta: { type: string, example: "22:00" }
 *               veiculo: { type: string }
 *               capacidade: { type: integer, example: 44 }
 *               paradas:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Rota criada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rota' }
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", controller.list);
router.post("/", authorize("administrador"), validate(createRotaSchema), controller.create);

/**
 * @openapi
 * /rotas/{id}:
 *   get:
 *     tags: [Rotas]
 *     summary: Busca uma rota pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rota encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rota' }
 *       404:
 *         description: Rota não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *   patch:
 *     tags: [Rotas]
 *     summary: Atualiza uma rota (apenas administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               origem: { type: string }
 *               destino: { type: string }
 *               horarioIda: { type: string }
 *               horarioVolta: { type: string }
 *               veiculo: { type: string }
 *               capacidade: { type: integer }
 *               paradas: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Rota atualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Rota' }
 *       404:
 *         description: Rota não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *   delete:
 *     tags: [Rotas]
 *     summary: Remove uma rota (apenas administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Rota removida com sucesso
 *       404:
 *         description: Rota não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/:id", validate(idParamSchema, "params"), controller.getById);
router.patch(
  "/:id",
  authorize("administrador"),
  validate(idParamSchema, "params"),
  validate(updateRotaSchema),
  controller.update,
);
router.delete(
  "/:id",
  authorize("administrador"),
  validate(idParamSchema, "params"),
  controller.remove,
);

module.exports = router;
