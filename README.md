# Bagly - CI/CD Pipeline

Plataforma de reclamações de bagagens danificadas em voos aéreos, com pipeline de CI/CD completo usando Jenkins, SonarQube e Trivy.

## Arquitetura da Aplicação

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

## Arquitetura do Pipeline CI/CD

```
┌──────────────────────────────────────────────────────────────────┐
│                         PIPELINE CI                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1.Checkout ─► 2.Build ─► 3.Tests ─► 4.Sonar ─► 5.Trivy Repo    │
│                                         │            │           │
│                                         ▼            ▼           │
│                                   Coverage≥50%?  HIGH/CRIT?      │
│                                         │            │           │
│  6.Docker Build ─► 7.Trivy Image ─► 8.Push & Tag (main only)    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js 20, Fastify, TypeScript, Prisma |
| Banco de Dados | PostgreSQL 15 |
| Cache | Redis 7 |
| CI/CD | Jenkins (customizado), SonarQube, Trivy |
| Container | Docker, Docker Compose |
| Registry | Docker Registry (local) |

## Pré-requisitos

- Docker e Docker Compose
- Git
- Node.js 20+ (para desenvolvimento local)

## Estrutura do Projeto

```
bagly-cicd/
├── backend/                  # API Node.js/Fastify
│   ├── src/
│   ├── prisma/
│   └── Dockerfile
├── frontend/                 # React + Vite
│   ├── src/
│   └── Dockerfile
├── infra/                    # Stack CI/CD
│   ├── compose.yaml          # Jenkins + SonarQube + Registry
│   ├── .env.example
│   └── jenkins/
│       └── Dockerfile        # Jenkins customizado
├── deploy/                   # Stack de Deploy
│   ├── compose.yaml          # App + PostgreSQL + Redis
│   └── .env.example
├── Jenkinsfile               # Pipeline CI (8 stages)
└── README.md
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
cd infra
docker compose --env-file .env up -d --build
```

> **Nota**: O primeiro build demora alguns minutos pois cria a imagem customizada do Jenkins.

### 1.3 Imagem Customizada do Jenkins

A imagem `bagly-jenkins` inclui todas as ferramentas necessárias:

| Ferramenta | Uso |
|------------|-----|
| Docker CLI | Build e push de imagens |
| Trivy | Scan de vulnerabilidades |
| Node.js 20 | Build do projeto |
| Plugins | Git, Docker, SonarQube, etc (pré-instalados) |

### 1.4 Configurar Jenkins

1. Acessar http://localhost:8080
2. Obter senha inicial:
   ```bash
   docker exec bagly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Completar wizard de instalação
4. Criar usuário administrador
5. Configurar credenciais em **Manage Jenkins → Credentials**:

| ID | Tipo | Descrição |
|----|------|-----------|
| `github-credentials` | Username/Password | Usuário GitHub + PAT |
| `sonar-token` | Secret text | Token do SonarQube |

6. Configurar SonarQube em **Manage Jenkins → System**:
   - Nome: `SonarQube`
   - URL: `http://sonarqube:9000`
   - Token: credencial `sonar-token`

### 1.5 Configurar SonarQube

1. Acessar http://localhost:9000
2. Login: `admin` / `admin` (alterar na primeira vez)
3. Criar projetos:
   - `bagly-frontend`
   - `bagly-backend`
4. Gerar token em **My Account → Security**
5. Criar Quality Gate com cobertura mínima de 50%

## 2. Executar Pipeline

### 2.1 Criar job no Jenkins

1. **New Item** → Pipeline
2. Nome: `bagly-pipeline`
3. **Pipeline from SCM** → Git
4. URL: `https://github.com/SEU-USUARIO/bagly-cicd.git`
5. Credentials: `github-credentials`
6. Branch: `*/main`

### 2.2 Stages do Pipeline

| # | Stage | Descrição | Falha se... |
|---|-------|-----------|-------------|
| 1 | Checkout | Clone do repositório | - |
| 2 | Build | npm ci + npm run build | Build falhar |
| 3 | Unit Tests | npm run test:coverage | Testes falharem |
| 4 | SonarQube Scan | Análise + Quality Gate | Cobertura < 50% |
| 5 | Trivy Repo Scan | Scan do código fonte | HIGH ou CRITICAL |
| 6 | Docker Build | Build das imagens | Build falhar |
| 7 | Trivy Image Scan | Scan das imagens | HIGH ou CRITICAL |
| 8 | Push & Tag | Push + tag Git | Somente em `main` |

### 2.3 Regras de Qualidade

- **Cobertura mínima**: 50%
- **Trivy**: Pipeline falha se encontrar HIGH ou CRITICAL
- **Tag Git**: Criada somente em `main`, quando pipeline está verde

### 2.4 Versionamento

As imagens e tags seguem o padrão: `v1.0.${BUILD_NUMBER}`

Exemplos:
- Build 1: `v1.0.1`
- Build 15: `v1.0.15`
- Build 100: `v1.0.100`

## 3. Deploy Manual

### 3.1 Criar arquivo de ambiente

```bash
cd deploy
cp .env.example .env
```

Editar `deploy/.env`:
```env
# Tag da imagem (gerada pelo pipeline)
IMAGE_TAG=v1.0.1

# Banco de dados
POSTGRES_USER=bagly
POSTGRES_PASSWORD=sua-senha-segura
POSTGRES_DB=bagly

# JWT
JWT_SECRET=sua-chave-jwt-segura-com-32-caracteres

# Email (escolher uma opção)
EMAIL_FROM=noreply@bagly.com.br
RESEND_API_KEY=re_xxxxx
# ou
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-app-password
```

### 3.2 Subir aplicação

```bash
cd deploy
docker compose --env-file .env up -d
```

### 3.3 Acessar aplicação

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3333 |

### 3.4 Atualizar para nova versão

```bash
# 1. Editar .env com nova tag
IMAGE_TAG=v1.0.2

# 2. Atualizar containers
docker compose --env-file .env up -d
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
# Backend (38 testes)
cd backend
npm run test
npm run test:coverage

# Frontend (64 testes)
cd frontend
npm run test
npm run test:coverage
```

## 5. Funcionalidades da Aplicação

### Autenticação
- Login via CPF + OTP (código por email)
- JWT para sessões
- Rate limiting para proteção contra brute force

### Reclamações (Claims)
- Criar reclamação de bagagem danificada
- Upload de imagens (até 5 fotos, máx 5MB cada)
- Acompanhar status da reclamação
- Visualizar propostas de resolução

## 6. Portas

| Serviço | Porta | Stack |
|---------|-------|-------|
| Frontend | 3000 | Deploy |
| Backend | 3333 | Deploy |
| PostgreSQL (app) | 5432 | Deploy |
| Redis | 6379 | Deploy |
| Jenkins | 8080 | Infra |
| SonarQube | 9000 | Infra |
| Registry | 5000 | Infra |

## 7. Troubleshooting

### Jenkins não consegue executar Docker

```bash
# Verificar se o socket está montado
docker exec bagly-jenkins ls -la /var/run/docker.sock

# Se necessário, ajustar permissões
docker exec bagly-jenkins chmod 666 /var/run/docker.sock
```

### SonarQube não inicia (Linux)

```bash
# Aumentar limite de memória virtual
sudo sysctl -w vm.max_map_count=262144

# Para persistir após reboot
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### Verificar status dos containers

```bash
# Infra
docker compose -f infra/compose.yaml ps

# Deploy
docker compose -f deploy/compose.yaml ps
```

### Ver logs

```bash
# Jenkins
docker logs -f bagly-jenkins

# SonarQube
docker logs -f bagly-sonarqube

# Backend
docker logs -f bagly-backend
```

### Limpar tudo e recomeçar

```bash
# Parar e remover volumes
docker compose -f infra/compose.yaml down -v
docker compose -f deploy/compose.yaml down -v

# Remover imagens
docker rmi bagly-jenkins:latest
docker rmi $(docker images -q localhost:5000/bagly-*)
```

## Equipe

| Nome | Papel |
|------|-------|
| [Nome 1] | [Papel] |
| [Nome 2] | [Papel] |
| [Nome 3] | [Papel] |

## Licença

Projeto acadêmico - Uso educacional
