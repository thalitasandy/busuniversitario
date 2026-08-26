-- ============================================================
-- Bus Universitário — Dados de exemplo (seed)
-- As senhas de todos os usuários abaixo são: 123456
-- ============================================================

-- ------------------------------------------------------------
-- Rotas
-- ------------------------------------------------------------
INSERT INTO rotas (id, name, origem, destino, horario_ida, horario_volta, veiculo, capacidade, paradas) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Rota 1 · Pombal → UEPB (Campus VII)', 'Terminal Rodoviário de Pombal', 'UEPB - Campus VII, Patos', '17:00', '22:00', 'Ônibus 01 - ABC-1D23', 46, ARRAY['Terminal Rodoviário de Pombal', 'UEPB - Campus VII, Patos']),
  ('22222222-2222-2222-2222-222222222222', 'Rota 2 · Pombal → UFCG', 'Terminal Rodoviário de Pombal', 'UFCG, Patos', '16:30', '22:00', 'Ônibus 02 - EFG-4H56', 42, ARRAY['Terminal Rodoviário de Pombal', 'UFCG, Patos']),
  ('33333333-3333-3333-3333-333333333333', 'Rota 3 · Pombal → UNIFIP', 'Terminal Rodoviário de Pombal', 'UNIFIP, Patos', '17:00', '22:00', 'Ônibus 03 - IJK-7L89', 40, ARRAY['Terminal Rodoviário de Pombal', 'UNIFIP, Patos'])
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Usuários (hash bcrypt de "123456")
-- ------------------------------------------------------------
INSERT INTO usuarios (id, role, name, email, password_hash, status, instituicao, rota_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'administrador', 'Ana Coordenação', 'admin@pombal.edu.br', '$2b$10$ADaITL8.ckQzQEEZeEkJEOlo3uyWMZ9.OkcjtT2bd2D9m5QlYaYWS', 'aprovado', 'UEPB - Campus VII (Patos)', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuarios (id, role, name, email, password_hash, status, cnh, veiculo, rota_id) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'motorista', 'Carlos Motorista', 'motorista@pombal.edu.br', '$2b$10$ADaITL8.ckQzQEEZeEkJEOlo3uyWMZ9.OkcjtT2bd2D9m5QlYaYWS', 'aprovado', '01234567890', 'Ônibus 01 - ABC-1D23', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuarios (id, role, name, email, password_hash, status, matricula, curso, instituicao, rota_id) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'aluno', 'Marina Silva', 'aluno@pombal.edu.br', '$2b$10$ADaITL8.ckQzQEEZeEkJEOlo3uyWMZ9.OkcjtT2bd2D9m5QlYaYWS', 'aprovado', '20231045', 'Engenharia de Produção', 'UEPB - Campus VII (Patos)', '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000004', 'aluno', 'João Pedro', 'joao@pombal.edu.br', '$2b$10$ADaITL8.ckQzQEEZeEkJEOlo3uyWMZ9.OkcjtT2bd2D9m5QlYaYWS', 'pendente', '20231099', 'Ciência da Computação', 'UFCG (Patos)', '22222222-2222-2222-2222-222222222222'),
  ('a0000000-0000-0000-0000-000000000005', 'aluno', 'Beatriz Alves', 'bia@pombal.edu.br', '$2b$10$ADaITL8.ckQzQEEZeEkJEOlo3uyWMZ9.OkcjtT2bd2D9m5QlYaYWS', 'aprovado', '20231120', 'Agronomia', 'UFCG - Campus Pombal', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Confirmações de presença (hoje)
-- ------------------------------------------------------------
INSERT INTO confirmacoes (aluno_id, rota_id, data, sentido) VALUES
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'ida-volta'),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'ida')
ON CONFLICT (aluno_id, data) DO NOTHING;

-- ------------------------------------------------------------
-- Ocorrências
-- ------------------------------------------------------------
INSERT INTO ocorrencias (motorista_id, rota_id, data, tipo, mensagem) VALUES
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'conclusao', 'Viagem de ida concluída sem intercorrências.');

-- ------------------------------------------------------------
-- Notificações
-- ------------------------------------------------------------
INSERT INTO notificacoes (audience, rota_id, title, message) VALUES
  ('aluno', '11111111-1111-1111-1111-111111111111', 'Ajuste de horário', 'A saída de amanhã da Rota Centro → UFCG será às 06:35.');
