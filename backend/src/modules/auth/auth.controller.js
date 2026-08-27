const usuariosRepository = require("../usuarios/usuarios.repository");
const { hashPassword, comparePassword } = require("../../utils/password");
const { signToken } = require("../../utils/jwt");
const { mapUsuario } = require("../../utils/serializers");
const AppError = require("../../utils/AppError");

async function register(req, res, next) {
  try {
    const data = req.body; // já validado pelo middleware `validate`

    const existente = await usuariosRepository.findByEmail(data.email);
    if (existente) {
      throw new AppError("Já existe um usuário cadastrado com este e-mail.", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const usuario = await usuariosRepository.create({
      role: data.role,
      name: data.name,
      email: data.email,
      passwordHash,
      matricula: data.matricula,
      curso: data.curso,
      instituicao: data.instituicao,
      cnh: data.cnh,
      veiculo: data.veiculo,
      routeId: data.routeId,
    });

    const token = signToken({ id: usuario.id, role: usuario.role });

    return res.status(201).json({
      token,
      usuario: mapUsuario(usuario),
      mensagem: "Cadastro realizado. Aguarde a aprovação da administração.",
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const usuario = await usuariosRepository.findByEmail(email);
    if (!usuario) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const senhaConfere = await comparePassword(password, usuario.password_hash);
    if (!senhaConfere) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    // Login é permitido mesmo com status "pendente"/"rejeitado" — o frontend usa isso
    // para mostrar a tela de "cadastro em análise". As ações que exigem aprovação
    // (confirmar presença, registrar ocorrência) são bloqueadas por `requireApproved`
    // nas rotas dos respectivos módulos, não aqui.
    const token = signToken({ id: usuario.id, role: usuario.role });

    return res.json({ token, usuario: mapUsuario(usuario) });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await usuariosRepository.findById(req.user.id);
    if (!usuario) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    return res.json(mapUsuario(usuario));
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me };
