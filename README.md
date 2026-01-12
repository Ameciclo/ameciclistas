# Ameciclistas - Sistema de Gestão da Ameciclo

Sistema web integrado ao Telegram para gestão de recursos, empréstimos e atividades da Ameciclo (Associação Metropolitana de Ciclistas do Recife). O sistema oferece uma interface híbrida que funciona tanto como Telegram Web App quanto como aplicação web tradicional com autenticação por email.

## 🚀 Tecnologias

- **Framework**: Remix v2.12+ (React + Vite)
- **Estilização**: Tailwind CSS v3.4+ com fonte Ubuntu
- **Backend**: Firebase (Firestore + Realtime Database)
- **Integração**: Telegram Web App SDK v7.10+
- **Autenticação**: Magic Link (Email) + Telegram WebApp
- **APIs Externas**: Google Sheets, Strapi CMS
- **Linguagem**: TypeScript v5.1+
- **Deploy**: Vercel (configurado)

## 📋 Funcionalidades

### 🏠 **Menu Principal**
- Sistema de permissões hierárquico por categoria de usuário
- Interface responsiva (Telegram Web App + Web tradicional)
- Modo de desenvolvimento com simulação de usuários
- Login web via magic link para acesso fora do Telegram

### 📚 **Sistema de Biblioteca**
- **Acervo Público**: Busca por título/autor, filtros por disponibilidade, tipo e ano
- **Empréstimos**: Sistema completo para AMECICLISTAS com solicitação e aprovação
- **Gestão**: Interface para coordenadores aprovarem solicitações e gerenciarem devoluções
- **Estatísticas**: Métricas públicas detalhadas (livros mais emprestados, tempo médio, etc.)
- **Dados**: Catálogo com exemplares, ISBN, resumos e imagens

### 🚴 **Bota pra Rodar**
- **Empréstimo de Bicicletas**: Sistema completo com códigos únicos por bike
- **Dashboard IoT**: Monitoramento em tempo real via Firebase Realtime Database
- **Métricas**: Bateria, conectividade WiFi (RSSI/SSID), sessões de uso
- **Gestão**: Aprovação de solicitações e controle de devoluções
- **Estatísticas**: Análise de uso e disponibilidade

### 📦 **Registro de Empréstimos (Inventário)**
- **Categorização**: Oficina, mobiliário, eletrônicos, ferramentas, etc.
- **Controle**: Sistema de códigos únicos e rastreamento de disponibilidade
- **Workflow**: Solicitação → Aprovação → Empréstimo → Devolução
- **Filtros**: Busca avançada por categoria, subcategoria e disponibilidade

### 🏪 **Recursos Independentes**
- **Produtos**: Camisas (variações de tamanho), broches, cervejas, peças, livros
- **Vendas**: Registro próprio ou para terceiros com controle de estoque
- **Doações**: Sistema de doações com valores personalizados
- **Pagamentos**: Integração PIX com comprovantes
- **Gestão**: Interface para coordenadores confirmarem vendas/doações
- **Relatórios**: Histórico detalhado com filtros por período

### 💰 **Gestão Financeira**
- **Solicitações**: Formulário estruturado para pedidos de pagamento
- **Fornecedores**: CRUD completo com dados de contato e métodos de pagamento
- **Projetos**: Controle de orçamentos via Google Sheets
- **Transparência**: Integração com sistema de transparência financeira

### 👥 **Gestão de Usuários e Conteúdo**
- **Usuários**: Cadastro, categorização e gestão de permissões
- **Grupos de Trabalho**: Integração com Strapi CMS para projetos e coordenação
- **Links Úteis**: Organização de recursos internos e externos
- **Eventos**: Sistema de criação e gestão de eventos
- **Newsletter**: Editor de boletim informativo para coordenadores

## 🔐 Sistema de Permissões

| Categoria | Descrição | Funcionalidades |
|-----------|-----------|----------------|
| `ANY_USER` | Usuários não cadastrados | Biblioteca (consulta), Bota pra Rodar (consulta), Links úteis, Estatísticas |
| `AMECICLISTAS` | Membros da Ameciclo | + Empréstimos, Recursos Independentes, Grupos de Trabalho, Criar Eventos |
| `PROJECT_COORDINATORS` | Coordenadores de projetos | + Gestão de empréstimos, Solicitações financeiras, Gestão de fornecedores |
| `AMECICLO_COORDINATORS` | Coordenação geral | + Gestão de usuários, Newsletter, Todas as funcionalidades |
| `DEVELOPMENT` | Modo desenvolvimento | Simulação de usuários e permissões para testes |

**Hierarquia**: Cada nível superior herda as permissões dos níveis inferiores.

## 📁 Estrutura do Projeto

```
app/
├── api/                           # Integrações externas
│   ├── calendar.server.ts         # Google Calendar
│   ├── cms.server.ts              # Strapi CMS
│   ├── firebaseAdmin.server.js    # Firebase Admin SDK
│   ├── firebaseConnection.server.js # Firestore
│   ├── firebaseRealtime.server.ts # Realtime Database (IoT)
│   ├── firebaseRest.server.ts     # Firebase REST API
│   ├── googleService.ts           # Google Sheets API
│   ├── magicLink.server.ts        # Autenticação por email
│   ├── newsletter.server.ts       # Sistema de newsletter
│   └── webAuth.server.ts          # Autenticação web
├── components/                    # Componentes React
│   ├── Forms/                     # Formulários e inputs
│   ├── BatteryChart.tsx           # Gráfico de bateria (IoT)
│   ├── BibliotecaGestao.tsx       # Gestão da biblioteca
│   ├── BotaPraRodarGestao.tsx     # Gestão de bicicletas
│   ├── DevMenu.tsx                # Menu de desenvolvimento
│   ├── NewsletterPreview.tsx      # Preview da newsletter
│   ├── PaginacaoBicicletas.tsx    # Paginação de bikes
│   ├── PaginacaoInventario.tsx    # Paginação do inventário
│   ├── PaginacaoLivros.tsx        # Paginação de livros
│   ├── ProtectedComponent.tsx     # Controle de acesso
│   ├── RegistroEmprestimosGestao.tsx # Gestão do inventário
│   └── WebUserInfo.tsx            # Info do usuário web
├── handlers/                      # Lógica de negócio (Remix)
│   ├── actions/                   # Server actions
│   │   ├── biblioteca.ts
│   │   ├── bota-pra-rodar.ts
│   │   ├── criar-evento.ts
│   │   ├── gestao-fornecedores.ts
│   │   ├── registro-emprestimos.ts
│   │   ├── solicitar-pagamento.ts
│   │   ├── user-action.ts
│   │   └── users-action.ts
│   └── loaders/                   # Data loaders
│       ├── _common.ts
│       ├── biblioteca.ts
│       ├── bota-pra-rodar.ts
│       ├── grupos-de-trabalho.ts
│       ├── links-uteis.ts
│       └── [outros].ts
├── routes/                        # Páginas da aplicação
│   ├── _index.tsx                 # Menu principal
│   ├── biblioteca.tsx             # Sistema de biblioteca
│   ├── bota-pra-rodar.tsx         # Sistema de bikes
│   ├── dashboard.*.tsx            # Dashboard IoT
│   ├── recursos-independentes.*.tsx # Sistema de vendas
│   ├── auth.*.tsx                 # Autenticação
│   └── [outras rotas]
├── utils/                         # Utilitários
│   ├── authMiddleware.ts          # Middleware de auth
│   ├── devContext.tsx             # Contexto de desenvolvimento
│   ├── isAuthorized.ts            # Verificação de permissões
│   ├── telegramInit.ts            # Inicialização do Telegram
│   ├── types.ts                   # Definições TypeScript
│   ├── useAuth.ts                 # Hook de autenticação
│   └── webAuthMiddleware.ts       # Auth web
└── [arquivos raiz]                # Configurações Remix

public/
├── images/                        # Logos e ícones da Ameciclo
├── favicon.ico
└── logo-*.png                     # Logos para temas

scripts/                           # Scripts utilitários
├── migrate-user-data.js           # Migração de dados
├── populate-inventario.js         # Popular inventário
└── populate-products.js           # Popular produtos

temp/                              # Arquivos temporários de desenvolvimento
```

## ⚙️ Instalação

**Requisitos**: Node.js >= 20.0.0

```bash
# Clonar o repositório
git clone [url-do-repositorio]
cd ameciclistas

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Firebase, Google, etc.

# Para dashboard IoT (opcional)
cp .env.dashboard.example .env
# Configurar credenciais do Firebase Realtime Database

# Popular dados iniciais (opcional)
node scripts/populate-products.js
node scripts/populate-inventario.js
node scripts/migrate-user-data.js
```

## 🚀 Desenvolvimento

```bash
# Servidor de desenvolvimento (porta 8002)
npm run dev

# Verificar tipos TypeScript
npm run typecheck

# Linting com ESLint
npm run lint

# Acessar a aplicação
# http://localhost:8002 - Interface web
# Telegram Web App - Via bot configurado
```

### 🧪 Modo de Desenvolvimento

O sistema possui um modo de desenvolvimento integrado que permite:
- Simular diferentes tipos de usuários
- Testar permissões sem Telegram
- Interface web completa para desenvolvimento
- Debug de autenticação e fluxos

## 📦 Deploy

```bash
# Build para produção
npm run build

# Executar em produção
npm start
```

**Arquivos de deploy**:
- `build/server` - Servidor
- `build/client` - Cliente

## 🔧 Configuração

### Firebase
**Firestore Database**:
- Configure o projeto no Firebase Console
- Ative Firestore Database
- Configure regras de segurança
- Adicione credenciais no `.env`

**Realtime Database** (para Dashboard IoT):
- Ative Firebase Realtime Database
- Configure para o projeto `botaprarodar-routes`
- Estrutura esperada: `bikes/{bikeId}/{checkins|sessions|status}`

### Telegram Web App
- Crie um bot via @BotFather
- Configure o Web App URL apontando para sua aplicação
- Adicione o token do bot no `.env`
- Configure comandos do bot

### Autenticação Web (Magic Link)
- Configure provedor de email (SMTP)
- Defina URLs de callback
- Configure templates de email

### Integrações Externas

**Google Sheets API**:
- Configure Google Cloud Console
- Ative Sheets API
- Crie credenciais de serviço
- Adicione JSON das credenciais

**Strapi CMS**:
- Configure instância do Strapi
- Defina collections para grupos de trabalho
- Configure API tokens

**Google Calendar** (opcional):
- Ative Calendar API
- Configure OAuth ou service account

## 📚 Documentação Específica

- **[Dashboard IoT](DASHBOARD_README.md)** - Monitoramento de bicicletas em tempo real
- **[Mapeamento de Rotas](MAPEAMENTO_ROTAS_USUARIOS.md)** - Fluxos completos de navegação
- **[Ciclos de Usuário](CICLOS_COMPLETOS_USUARIO.md)** - Jornadas dos usuários
- **[Correções UX](CORRECOES_FEEDBACK_UX.md)** - Melhorias de experiência
- **[Diagnóstico de Botões](DIAGNOSTICO_BOTOES_ACTION.md)** - Análise de interações
- **[Fluxo de Empréstimos](FLUXO_DETALHADO_SOLICITACAO_EMPRESTIMO.md)** - Processo detalhado

## 🛠️ Scripts Utilitários

```bash
# Popular produtos para venda (camisas, broches, cervejas, etc.)
node scripts/populate-products.js

# Popular inventário (ferramentas, mobiliário, eletrônicos)
node scripts/populate-inventario.js

# Migrar dados de usuários entre versões
node scripts/migrate-user-data.js
```

### Estrutura dos Scripts
- **populate-products.js**: Cria produtos com variações (tamanhos, cores)
- **populate-inventario.js**: Popula itens do inventário por categoria
- **migrate-user-data.js**: Migra dados de usuários entre estruturas

## 🎨 Estilização

Utiliza [Tailwind CSS](https://tailwindcss.com/) v3.4+ com:
- **Fonte**: Ubuntu como fonte principal
- **Cores**: Paleta da identidade visual Ameciclo (teal como cor primária)
- **Responsividade**: Design mobile-first
- **Componentes**: Sistema consistente de botões, cards e formulários
- **Telegram Integration**: Adaptação automática aos temas do Telegram
- **Acessibilidade**: Contraste e navegação otimizados

## 🔗 Integrações

### Principais
- **Telegram Web App SDK v7.10+**: Interface nativa no Telegram com temas dinâmicos
- **Firebase Firestore**: Banco principal para dados estruturados
- **Firebase Realtime Database**: Dados IoT das bicicletas em tempo real
- **Magic Link Authentication**: Sistema de login por email sem senha

### Externas
- **Google Sheets API**: Sincronização de dados financeiros e projetos
- **Strapi CMS**: Gestão de grupos de trabalho e projetos
- **Google Calendar API**: Integração com eventos (opcional)
- **PIX**: Sistema de pagamentos via QR Code

### Desenvolvimento
- **Vercel**: Plataforma de deploy configurada
- **Vite**: Build tool integrado ao Remix
- **ESLint + TypeScript**: Qualidade de código

## 📱 Uso

### Via Telegram
1. Acesse o bot da Ameciclo no Telegram
2. Clique em "Abrir Web App" ou use comando `/start`
3. Interface se adapta automaticamente ao tema do Telegram
4. Funcionalidades baseadas nas permissões do usuário

### Via Web Browser
1. Acesse a URL da aplicação
2. Clique em "Fazer Login Web"
3. Insira seu email para receber magic link
4. Clique no link recebido por email
5. Acesso completo às funcionalidades

### Modo Desenvolvimento
1. Configure `DEVELOPMENT` mode
2. Simule diferentes tipos de usuários
3. Teste fluxos sem dependências externas
4. Debug de permissões e autenticação

## 🤝 Contribuição

Este é um sistema interno da Ameciclo. Para contribuições:

### Processo
1. **Contato**: Coordenação técnica da Ameciclo
2. **Padrões**: ESLint + TypeScript + Prettier
3. **Testes**: Modo desenvolvimento obrigatório
4. **Documentação**: Atualizar README e docs específicas
5. **Review**: Aprovação da coordenação técnica

### Estrutura de Desenvolvimento
- **Handlers**: Lógica de negócio separada das rotas
- **Components**: Componentes reutilizáveis
- **Utils**: Funções utilitárias e tipos
- **API**: Integrações externas isoladas

### Boas Práticas
- Usar TypeScript para type safety
- Implementar controle de permissões
- Documentar novas rotas no mapeamento
- Testar em modo dev antes de produção

## 📄 Licença

Este projeto está licenciado sob a **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### Resumo da Licença
- ✅ **Uso comercial** permitido
- ✅ **Modificação** permitida
- ✅ **Distribuição** permitida
- ✅ **Uso privado** permitido
- ⚠️ **Copyleft forte**: Modificações devem ser disponibilizadas sob a mesma licença
- ⚠️ **Divulgação de código**: Uso em rede requer disponibilização do código fonte
- ❌ **Sem garantia**: Software fornecido "como está"

### Termos Adicionais
Se você modificar este programa ou qualquer trabalho derivado, vinculando ou combinando com outro código, tal código também deve ser disponibilizado sob os termos da GNU AGPL versão 3.

**Copyright (C) 2024 Ameciclo - Associação Metropolitana de Ciclistas do Recife**

Para mais informações sobre esta licença, visite: https://www.gnu.org/licenses/agpl-3.0.html
