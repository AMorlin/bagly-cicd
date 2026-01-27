# Bagly - CI/CD Pipeline

Plataforma de reclamações de bagagens danificadas em voos aéreos, com pipeline de CI/CD completo usando Jenkins, SonarQube e Trivy.

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  PostgreSQL │
│   (React)   │     │  (Fastify)  │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    Redis    │
                   │   (Cache)   │
                   └─────────────┘
```

## Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js 20, Fastify, TypeScript, Prisma |
| Banco de Dados | PostgreSQL 15 |
| Cache | Redis 7 |
| CI/CD | Jenkins, SonarQube, Trivy |
| Container | Docker, Docker Compose |

## Pré-requisitos

- Docker e Docker Compose
- Git
- Node.js 20+ (para desenvolvimento local)

## Estrutura do Projeto

```
bagly-cicd/
├── backend/              # API Node.js/Fastify
├── frontend/             # React + Vite
├── infra/                # Stack CI/CD (Jenkins + SonarQube)
├── deploy/               # Stack de Deploy (App + DB)
├── Jenkinsfile           # Pipeline CI
└── Makefile              # Comandos de automação
```

## 1. Configurar Infraestrutura (CI/CD)

### 1.1 Criar arquivo de ambiente

```bash
cd infra
cp .env.example .env
```

Editar `infra/.env`:
```env
SONAR_DB_USER=sonar
SONAR_DB_PASSWORD=sua-senha-segura
SONAR_DB_NAME=sonarqube
```

### 1.2 Subir Jenkins + SonarQube

```bash
docker compose -f infra/compose.yaml --env-file .env up -d
```

### 1.3 Configurar Jenkins

1. Acessar http://localhost:8080
2. Obter senha inicial:
   ```bash
   docker exec bagly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Instalar plugins sugeridos
4. Criar usuário administrador
5. Instalar plugins adicionais:
   - Docker Pipeline
   - SonarQube Scanner
   - NodeJS
6. Configurar credenciais:
   - `github-credentials` (Username/Password com PAT)
   - `sonar-token` (Secret text)

### 1.4 Configurar SonarQube

1. Acessar http://localhost:9000
2. Login: admin / admin (alterar na primeira vez)
3. Criar projeto "bagly"
4. Gerar token de autenticação
5. Criar Quality Gate:
   - Cobertura mínima: 50%

## 2. Executar Pipeline

### 2.1 Criar job no Jenkins

1. New Item → Pipeline
2. Nome: `bagly-pipeline`
3. Pipeline from SCM → Git
4. URL: `https://github.com/SEU-USUARIO/bagly-cicd.git`
5. Credentials: `github-credentials`
6. Branch: `*/main`

### 2.2 Stages do Pipeline

| Stage | Descrição |
|-------|-----------|
| Checkout | Clone do repositório |
| Build | npm install + build |
| Unit Tests | Execução de testes com cobertura |
| SonarQube Scan | Análise de qualidade + Quality Gate |
| Trivy Repo Scan | Scan de vulnerabilidades no código |
| Docker Build | Build das imagens |
| Trivy Image Scan | Scan de vulnerabilidades nas imagens |
| Create Git Tag | Criação de tag (somente main) |

### 2.3 Regras de Qualidade

- **Cobertura mínima**: 50%
- **Trivy**: Pipeline falha se encontrar HIGH ou CRITICAL
- **Tag Git**: Criada somente em main, após pipeline verde

## 3. Deploy Manual

### 3.1 Criar arquivo de ambiente

```bash
cd deploy
cp .env.example .env
```

Editar `deploy/.env`:
```env
IMAGE_TAG=v1.0.1

POSTGRES_USER=bagly
POSTGRES_PASSWORD=sua-senha-segura
POSTGRES_DB=bagly

JWT_SECRET=sua-chave-jwt-segura

# Email (escolher uma opção)
EMAIL_FROM=noreply@bagly.com.br
RESEND_API_KEY=re_xxxxx
```

### 3.2 Subir aplicação

```bash
docker compose -f deploy/compose.yaml --env-file .env up -d
```

### 3.3 Acessar aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333

### 3.4 Atualizar para nova versão

```bash
# Alterar IMAGE_TAG no .env para a nova tag
# Exemplo: IMAGE_TAG=v1.0.2

docker compose -f deploy/compose.yaml --env-file .env up -d
```

## 4. Desenvolvimento Local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Testes

```bash
# Backend
cd backend
npm run test
npm run test:coverage

# Frontend
cd frontend
npm run test
npm run test:coverage
```

## 5. Funcionalidades da Aplicação

### Autenticação
- Login via CPF + OTP (código por email)
- JWT para sessões

### Reclamações (Claims)
- Criar reclamação de bagagem danificada
- Upload de imagens (até 5 fotos)
- Acompanhar status da reclamação
- Visualizar propostas de resolução

## 6. Portas

| Serviço | Porta |
|---------|-------|
| Frontend | 3000 |
| Backend | 3333 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Jenkins | 8080 |
| SonarQube | 9000 |
| Registry | 5000 |

## 7. Troubleshooting

### Jenkins não consegue executar Docker

```bash
# Dentro do container Jenkins
docker exec -it bagly-jenkins bash
chmod 666 /var/run/docker.sock
```

### SonarQube não inicia (Linux)

```bash
sudo sysctl -w vm.max_map_count=262144
```

### Limpar volumes e recomeçar

```bash
docker compose -f infra/compose.yaml down -v
docker compose -f deploy/compose.yaml down -v
```

## Equipe

| Nome | Papel |
|------|-------|
| [Nome 1] | [Papel] |
| [Nome 2] | [Papel] |
| [Nome 3] | [Papel] |

## Licença

Projeto acadêmico - Uso educacional
