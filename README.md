# Sistema de Biblioteca — Back-end (`jwt-api`)

API RESTful para gestão de biblioteca desenvolvida com **Node.js**, **Express 5**, **Sequelize**, **SQLite** e autenticação **JWT (Access Token + Refresh Token com rotação)**.

O sistema gerencia **atendentes e administradores**, **categorias**, **autores**, **livros** (com múltiplos autores e controle de estoque), **leitores**, **empréstimos e devoluções** (com cálculo automático de multa e transações no banco) e **relatório de dashboard**.

---

## 1. Como instalar e rodar o projeto

### Pré-requisitos
- Node.js 20 ou superior e npm
- Front-end do projeto (`jwt-app`) rodando na porta `3000`

### Passo a passo

```bash
# 1. Entre na pasta da API e instale as dependências
cd jwt-api
npm install

# 2. Crie o arquivo .env a partir do exemplo
cp .envex .env        # no Windows (CMD): copy .envex .env
```

### Gerando as chaves secretas com `npx new-pass-me`

Para gerar chaves fortes e aleatórias para o `JWT_SECRET` e o `JWT_REFRESH_SECRET`, execute no terminal:

```bash
npx new-pass-me
```

Rode o comando duas vezes (uma para cada chave) e preencha o seu arquivo `.env`:

```env
JWT_SECRET=chave-gerada-pelo-npx-new-pass-me
JWT_REFRESH_SECRET=outra-chave-gerada-pelo-npx-new-pass-me
PORT=3001
```

> **Observação sobre a porta:** A API roda na porta **`3001`** para que o front-end em Next.js (`jwt-app`) possa rodar na sua porta padrão **`3000`**, já liberada no CORS do `index.js`.

### Iniciando o servidor

```bash
npm start
# SERVIDOR RODANDO http://localhost:3001
```

---

## 2. Usuário Administrador do Seed

Ao iniciar o servidor (`npm start`), o `db.sync()` cria as tabelas no SQLite e executa automaticamente o seed (`config/seed.js`). Caso ainda não exista nenhum administrador cadastrado, o sistema cria o primeiro admin com as credenciais padrão:

| Campo | Valor padrão | Variável opcional no `.env` |
|---|---|---|
| **Nome** | `Admin` | `ADMIN_NAME` |
| **Usuário** | `admin` | `ADMIN_USERNAME` |
| **E-mail** | `admin@biblioteca.com` | `ADMIN_EMAIL` |
| **Senha** | `123456` | `ADMIN_PASSWORD` |
| **Perfil** | Administrador (`isAdmin: true`) | — |

---

## 3. Arquitetura e Organização

O projeto segue a separação em módulos por recurso (`router → controller → service → model`), centralizando os relacionamentos em `models/index.js`:

```text
jwt-api/
├── auth/                (router, controller, service, middleware, refreshToken.model, logoutList.model)
├── user/                (atendentes e administradores)
├── category/            (categorias de livros)
├── author/              (autores)
├── book/                (livros, filtros e associação N:N com autores)
├── reader/              (leitores e histórico de empréstimos)
├── loan/                (empréstimos e devoluções com transação e cálculo de multa)
├── report/              (totais do dashboard para administradores)
├── config/
│   ├── db.js            (conexão Sequelize + SQLite)
│   └── seed.js          (criação automática do primeiro admin)
├── models/
│   └── index.js         (associações 1:N e N:N via BookAuthor)
├── bruno-collection/    (coleção nativa do Bruno pronta para abrir)
├── colecao-biblioteca.json (coleção exportada no formato Postman v2.1 / Insomnia / Bruno)
└── index.js
```

---

## 4. Decisões Técnicas Tomadas

1. **Manutenção da `logout_list` junto com a tabela `RefreshToken`:**
   - **Justificativa:** Como o JWT de acesso (`accessToken`) é *stateless* e possui validade de **15 minutos**, se o logout apenas revogasse o `refreshToken` na tabela `RefreshToken`, o `accessToken` emitido antes do logout continuaria funcionando até completar os 15 minutos.
   - Mantendo a tabela `logout_list` como *blacklist* para o `accessToken` em conjunto com o `revoked: true` na tabela `RefreshToken`, o logout invalida **imediatamente** ambos os tokens.
2. **Rotação de Refresh Token e Detecção de Roubo/Reuso:**
   - O `refreshToken` é gerado com `crypto.randomBytes(40).toString('hex')`, possui validade de **7 dias** e fica salvo na tabela `RefreshToken`.
   - A cada chamada em `POST /v1/auth/refresh`, o refresh token usado é marcado como `revoked = true` e um novo par (`accessToken` + `refreshToken`) é emitido.
   - Se alguém tentar reutilizar um `refreshToken` que já consta como `revoked = true`, a API identifica a tentativa de reutilização indevida e **revoga todos os refresh tokens daquele usuário** por segurança.
3. **Ocultação do Hash da Senha (`password`) nas Respostas:**
   - Mesmo com a senha armazenada usando hash `bcrypt`, definimos `User.prototype.toJSON` no `user.model.js` e `attributes: { exclude: ['password'] }` nas buscas do `user.service.js` para garantir que o hash nunca seja enviado no JSON de resposta (prevenindo ataques de dicionário/força bruta *offline*).
4. **Transações no Banco (`db.transaction`) e Status `ATRASADO`:**
   - Tanto o registro de empréstimo (que valida limite de 3 empréstimos ativos, ausência de atrasos e estoque `availableCopies > 0`, decrementando `-1`) quanto a devolução (que calcula a multa de **R$ 1,00 por dia de atraso** e incrementa `+1` no estoque) rodam dentro de `db.transaction()` do Sequelize.
   - Antes das listagens e buscas de empréstimos, o sistema atualiza automaticamente para `status = 'ATRASADO'` qualquer empréstimo ainda não devolvido (`returnDate: null`) cujo `dueDate` já tenha passado, permitindo filtrar diretamente por `?status=ATRASADO`.
5. **Proteção contra Exclusão com Vínculos (`409 Conflict`):**
   - Não é permitido excluir categorias com livros, autores com livros, livros com empréstimos ou leitores com histórico de empréstimos; a API retorna status **409 Conflict** com mensagem explicativa. Atendentes não possuem rota de exclusão, sendo ativados ou desativados via `PATCH /v1/user/:id/active`.

---

## 5. Endpoints da API

Todas as rotas abaixo, exceto `/v1/auth/login` e `/v1/auth/refresh`, exigem o cabeçalho `Authorization: Bearer <accessToken>`.  
**(A)** = Rota restrita a Administrador (`verifyAdmin`, retorna **403** para atendentes).

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/v1/auth/login` | Login, retorna `{ accessToken, refreshToken, user }` |
| `POST` | `/v1/auth/refresh` | Rotaciona o refresh token e devolve novo par de tokens |
| `POST` | `/v1/auth/logout` | Revoga o refresh token e invalida o access token atual |
| `GET` | `/v1/auth/me` | Retorna os dados do usuário logado |
| `GET` / `POST` | `/v1/user` | Listar / criar atendente **(A)** |
| `GET` | `/v1/user/:id` e `/v1/user/email/:email` | Buscar usuário por ID ou e-mail |
| `PUT` | `/v1/user/:id` | Editar nome, usuário e e-mail do atendente **(A)** |
| `PATCH` | `/v1/user/:id/active` | Ativar ou desativar atendente `{ "active": true\|false }` **(A)** |
| `GET` / `POST` / `PUT` / `DELETE` | `/v1/categories` | CRUD de categorias (escrita **A**) |
| `GET` / `POST` / `PUT` / `DELETE` | `/v1/authors` | CRUD de autores (escrita **A**) |
| `GET` / `POST` / `PUT` / `DELETE` | `/v1/books` | CRUD de livros com categoria e autores (escrita **A**) |
| `GET` | `/v1/books?title=&categoryId=&authorId=&available=true` | Busca de livros com filtros combinados |
| `GET` / `POST` / `PUT` / `DELETE` | `/v1/readers` | CRUD de leitores |
| `GET` | `/v1/readers/:id/loans` | Histórico de empréstimos de um leitor específico |
| `POST` | `/v1/loans` | Registrar empréstimo `{ bookId, readerId }` |
| `PATCH` | `/v1/loans/:id/return` | Registrar devolução e calcular multa se houver atraso |
| `GET` | `/v1/loans?status=ATIVO\|ATRASADO\|DEVOLVIDO` | Listar empréstimos (com filtro opcional por status) |
| `GET` | `/v1/reports/dashboard` | Totais: livros, exemplares, empréstimos ativos, atrasados e multas **(A)** |

---

## 6. Coleção de Testes (Bruno / Postman / Insomnia)

Dentro da pasta `jwt-api` estão disponíveis duas formas para testar todas as rotas:
1. **`colecao-biblioteca.json`**: arquivo exportado no padrão Postman Collection v2.1 (compatível com **Postman**, **Insomnia** e **Bruno** via *Import Collection*).
2. **`bruno-collection/`**: pasta nativa do **Bruno** (basta clicar em *Open Collection* no Bruno e selecionar a pasta `jwt-api/bruno-collection`).
