# Bus Universitário — Backend

API REST do sistema de transporte universitário (Pombal → Patos), construída para acompanhar o
frontend em `thalitasandy/busuniversitario`. Gerencia usuários (alunos, motoristas e
administradores), rotas de ônibus, confirmações de presença, ocorrências relatadas pelos
motoristas e notificações enviadas pela administração.

## Stack

- **Node.js 20 + Express** — API REST
- **PostgreSQL 16** — banco de dados, rodando em container Docker
- **Docker Compose** — orquestração da API + banco
- **Swagger / OpenAPI 3.0** (`swagger-jsdoc` + `swagger-ui-express`) — documentação interativa
- **JWT + bcrypt** — autenticação e hash de senha
- **Zod** — validação de entrada
- **Helmet, CORS, express-rate-limit, morgan** — segurança e logging

## Como rodar (Docker — recomendado)

Pré-requisitos: Docker e Docker Compose instalados.

```bash
cd backend
cp .env.example .env
# edite o .env e troque JWT_SECRET por um valor aleatório e seguro
docker compose up --build
```

Isso sobe dois containers:

- `busuniversitario-db` — PostgreSQL na porta `5432`, com o schema e os dados de exemplo
  (`db/init/*.sql`) aplicados automaticamente na primeira subida.
- `busuniversitario-api` — a API na porta `3000`, com hot-reload via `nodemon` (o código em
  `src/` é montado como volume).

Quando os logs mostrarem `Bus Universitário API rodando em http://localhost:3000`, a API está
pronta.

Para derrubar tudo (mantendo os dados): `docker compose down`
Para apagar também os dados do banco: `docker compose down -v`

## Como rodar sem Docker (Postgres local)

```bash
cd backend
npm install
cp .env.example .env
# ajuste DATABASE_URL/DB_HOST para apontar para o seu Postgres local
psql -U postgres -c "CREATE DATABASE busuniversitario;"
psql -U postgres -d busuniversitario -f db/init/01_schema.sql
psql -U postgres -d busuniversitario -f db/init/02_seed.sql
npm run dev
```

## Documentação da API (Swagger)

Com a API rodando, acesse:

- **Swagger UI (interativo):** http://localhost:3000/api-docs
- **Especificação OpenAPI (JSON):** http://localhost:3000/api-docs.json

Todos os endpoints (exceto `/auth/registrar` e `/auth/login`) exigem o header
`Authorization: Bearer <token>`. No Swagger UI, clique em **Authorize** e cole o token retornado
pelo login para testar as rotas protegidas direto pela interface.

## Usuários de exemplo (seed)

Todas as senhas abaixo são `123456`.

| Papel          | E-mail                     | Status    |
|----------------|-----------------------------|-----------|
| Administrador  | admin@pombal.edu.br         | aprovado  |
| Motorista      | motorista@pombal.edu.br     | aprovado  |
| Aluno          | aluno@pombal.edu.br         | aprovado  |
| Aluno          | joao@pombal.edu.br          | pendente  |
| Aluno          | bia@pombal.edu.br           | aprovado  |

## Modelo de domínio

- **Usuários** (`aluno` \| `motorista` \| `administrador`) — cadastro público, mas todo novo
  usuário entra com `status = pendente` e precisa ser aprovado por um administrador
  (`PATCH /usuarios/:id/status`) antes de ser considerado "ativo" pelas regras de negócio do
  frontend.
- **Rotas** — origem, destino, horários de ida/volta, veículo, capacidade e paradas.
- **Confirmações** — um aluno confirma presença (ida, volta ou ida-volta) para uma rota em uma
  data específica. Só existe **uma confirmação por aluno por dia**: confirmar de novo na mesma
  data substitui a anterior (upsert).
- **Ocorrências** — relatos do motorista durante a viagem (atraso, avaria, cancelamento,
  conclusão, outro).
- **Notificações** — avisos da administração, direcionados a `todos` ou a um papel específico.
  Para alunos/motoristas, a listagem (`GET /notificacoes`) só retorna as notificações **ainda não
  lidas** (mesmo comportamento do mock original, em que a notificação "some" da tela). O
  administrador vê todas as notificações, junto com a lista de quem já as leu.

## Principais endpoints

| Método | Rota                          | Quem acessa                  | Descrição                                  |
|--------|-------------------------------|-------------------------------|---------------------------------------------|
| POST   | `/api/auth/registrar`         | público                       | Cadastro (status inicial `pendente`)         |
| POST   | `/api/auth/login`             | público                       | Login → retorna `token` + `usuario`          |
| GET    | `/api/auth/me`                | autenticado                   | Dados do usuário logado                      |
| GET    | `/api/usuarios`                | administrador                 | Lista usuários (filtros: role, status, ...)  |
| PATCH  | `/api/usuarios/:id/status`     | administrador                 | Aprova/rejeita cadastro                      |
| GET    | `/api/rotas`                   | autenticado                   | Lista rotas                                  |
| POST/PATCH/DELETE `/api/rotas` | administrador | CRUD de rotas                                |
| GET    | `/api/confirmacoes`            | autenticado                   | Lista confirmações (aluno só vê as suas)     |
| POST   | `/api/confirmacoes`            | aluno                         | Confirma presença (upsert por data)          |
| DELETE | `/api/confirmacoes/:id`        | aluno (próprias) / admin      | Cancela confirmação                          |
| GET    | `/api/ocorrencias`             | autenticado                   | Lista ocorrências                            |
| POST   | `/api/ocorrencias`              | motorista                     | Registra ocorrência                          |
| GET    | `/api/notificacoes`            | autenticado                   | Lista notificações relevantes                |
| POST   | `/api/notificacoes`             | administrador                 | Envia notificação                            |
| PATCH  | `/api/notificacoes/:id/lida`    | autenticado                   | Marca notificação como lida                  |

A lista completa, com todos os parâmetros, corpos de requisição e respostas, está no Swagger UI.

## Estrutura de pastas

```
backend/
├── db/init/              # Schema SQL + seed, executados pelo container do Postgres
├── src/
│   ├── config/           # Conexão com o banco e configuração do Swagger
│   ├── middlewares/       # auth (JWT), autorização por papel, validação (Zod), erros
│   ├── modules/           # um módulo por domínio: routes + controller + repository + validation
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── rotas/
│   │   ├── confirmacoes/
│   │   ├── ocorrencias/
│   │   └── notificacoes/
│   ├── utils/             # JWT, hash de senha, AppError, serializers (snake_case → camelCase)
│   ├── app.js             # montagem do Express
│   └── server.js          # ponto de entrada
├── docker-compose.yml
├── Dockerfile
└── package.json
```

Cada módulo segue o mesmo padrão em camadas:

- **`*.routes.js`** — define os endpoints e a documentação Swagger (JSDoc `@openapi`)
- **`*.controller.js`** — orquestra a requisição/resposta e trata erros
- **`*.repository.js`** — SQL puro (parametrizado, sem ORM) usando `pg`
- **`*.validation.js`** — schemas Zod usados pelo middleware `validate`

## Integração com o frontend

As respostas da API já usam os mesmos nomes de campos (`camelCase`) definidos em
`lib/store.tsx` do frontend (`routeId`, `studentId`, `horarioIda`, `readBy`, etc.), então dá para
substituir o `StoreProvider` em memória por chamadas HTTP a esta API com o mínimo de atrito —
mantendo os tipos `Student`, `Driver`, `Admin`, `Route`, `Confirmation`, `Occurrence` e
`Notification` praticamente inalterados.

## Segurança — pontos de atenção antes de ir para produção

- Troque `JWT_SECRET` por um valor forte e mantenha-o fora do controle de versão.
- Configure `CORS_ORIGIN` para a URL real do frontend em produção (evite `*`).
- Considere expirar tokens mais rapidamente e implementar refresh token se necessário.
- As senhas nunca são armazenadas em texto puro — apenas o hash bcrypt (`password_hash`).
