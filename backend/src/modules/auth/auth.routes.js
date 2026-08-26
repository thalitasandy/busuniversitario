const { Router } = require("express");
const rateLimit = require("express-rate-limit");

const controller = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");

const router = Router();

// Protege login/registro contra força bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

/**
 * @openapi
 * /auth/registrar:
 *   post:
 *     tags: [Autenticação]
 *     summary: Cadastra um novo usuário (aluno, motorista ou administrador)
 *     description: O usuário é criado com status `pendente` e precisa ser aprovado por um administrador antes de operar normalmente no sistema.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [role, name, email, password, matricula, curso, instituicao, routeId]
 *                 properties:
 *                   role: { type: string, enum: [aluno] }
 *                   name: { type: string, example: Marina Silva }
 *                   email: { type: string, format: email }
 *                   password: { type: string, format: password, minLength: 6 }
 *                   matricula: { type: string, example: "20231045" }
 *                   curso: { type: string, example: Engenharia de Produção }
 *                   instituicao: { type: string, example: "UEPB - Campus VII (Patos)" }
 *                   routeId: { type: string, format: uuid }
 *               - type: object
 *                 required: [role, name, email, password, cnh, veiculo, routeId]
 *                 properties:
 *                   role: { type: string, enum: [motorista] }
 *                   name: { type: string }
 *                   email: { type: string, format: email }
 *                   password: { type: string, format: password, minLength: 6 }
 *                   cnh: { type: string }
 *                   veiculo: { type: string }
 *                   routeId: { type: string, format: uuid }
 *               - type: object
 *                 required: [role, name, email, password, instituicao]
 *                 properties:
 *                   role: { type: string, enum: [administrador] }
 *                   name: { type: string }
 *                   email: { type: string, format: email }
 *                   password: { type: string, format: password, minLength: 6 }
 *                   instituicao: { type: string }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *                 mensagem: { type: string }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post("/registrar", authLimiter, validate(registerSchema), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autentica um usuário e retorna um token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: aluno@pombal.edu.br }
 *               password: { type: string, format: password, example: "123456" }
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post("/login", authLimiter, validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Autenticação]
 *     summary: Retorna os dados do usuário autenticado
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/me", authenticate, controller.me);

module.exports = router;
