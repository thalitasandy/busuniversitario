-- ============================================================
-- Bus Universitário — Schema do banco de dados PostgreSQL
-- Executado automaticamente pelo container postgres na 1ª subida
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- necessário para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;   -- necessário para e-mail case-insensitive

-- ------------------------------------------------------------
-- Tabela: rotas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rotas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  origem        TEXT NOT NULL,
  destino       TEXT NOT NULL,
  horario_ida   TIME NOT NULL,
  horario_volta TIME NOT NULL,
  veiculo       TEXT,
  capacidade    INTEGER NOT NULL CHECK (capacidade > 0),
  paradas       TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Tabela: usuarios (aluno | motorista | administrador)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('aluno', 'motorista', 'administrador')),
  name          TEXT NOT NULL,
  email         CITEXT,
  password_hash TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),

  -- campos específicos de aluno
  matricula     TEXT,
  curso         TEXT,

  -- campos específicos de motorista
  cnh           TEXT,
  veiculo       TEXT,

  -- comuns a aluno/administrador (instituição de ensino)
  instituicao   TEXT,

  -- rota vinculada (aluno e motorista)
  rota_id       UUID REFERENCES rotas(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- e-mail é usado para login: precisa ser único e case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios (role);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios (status);
CREATE INDEX IF NOT EXISTS idx_usuarios_rota_id ON usuarios (rota_id);

-- ------------------------------------------------------------
-- Tabela: confirmacoes (presença de alunos em uma data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS confirmacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rota_id     UUID NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  data        DATE NOT NULL,
  sentido     VARCHAR(10) NOT NULL CHECK (sentido IN ('ida', 'volta', 'ida-volta')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, data)
);

CREATE INDEX IF NOT EXISTS idx_confirmacoes_rota_data ON confirmacoes (rota_id, data);

-- ------------------------------------------------------------
-- Tabela: ocorrencias (relatos do motorista durante a viagem)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocorrencias (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rota_id      UUID NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  data         DATE NOT NULL,
  tipo         VARCHAR(20) NOT NULL CHECK (tipo IN ('atraso', 'avaria', 'cancelamento', 'conclusao', 'outro')),
  mensagem     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_rota ON ocorrencias (rota_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_motorista ON ocorrencias (motorista_id);

-- ------------------------------------------------------------
-- Tabela: notificacoes (avisos enviados pela administração)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience    VARCHAR(20) NOT NULL CHECK (audience IN ('todos', 'aluno', 'motorista', 'administrador')),
  rota_id     UUID REFERENCES rotas(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_audience ON notificacoes (audience);

-- tabela associativa: quais usuários já leram/dispensaram cada notificação
CREATE TABLE IF NOT EXISTS notificacoes_lidas (
  notificacao_id UUID NOT NULL REFERENCES notificacoes(id) ON DELETE CASCADE,
  usuario_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  lida_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notificacao_id, usuario_id)
);

-- ------------------------------------------------------------
-- Trigger genérica para manter "updated_at" sempre atualizado
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_rotas_updated_at ON rotas;
CREATE TRIGGER trg_rotas_updated_at
  BEFORE UPDATE ON rotas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
