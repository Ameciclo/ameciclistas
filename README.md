# Ameciclobot - Sistema de Gestão da Ameciclo

Sistema web integrado ao Telegram para gestão de recursos, empréstimos e atividades da Ameciclo (Associação Metropolitana de Ciclistas do Recife).

## 🚀 Tecnologias

- **Framework**: Remix (React + Vite)
- **Estilização**: Tailwind CSS
- **Backend**: Firebase (Firestore)
- **Integração**: Telegram Web App SDK
- **Autenticação**: Google OAuth + Telegram
- **Linguagem**: TypeScript

## 📋 Funcionalidades

### 🏠 **Menu Principal**
- Sistema de permissões por categoria de usuário
- Interface responsiva integrada ao Telegram
- Modo de desenvolvimento para testes

### 📚 **Sistema de Biblioteca**
- Acervo público com busca por título/autor
- Sistema de empréstimos para AMECICLISTAS
- Gestão de solicitações e devoluções
- Estatísticas públicas de empréstimos
- 188 livros catalogados

### 🚴 **Bota pra Rodar**
- Empréstimo de bicicletas da Ameciclo
- Controle de disponibilidade
- Sistema de aprovação por coordenadores
- Histórico de empréstimos

### 📦 **Registro de Empréstimos (Inventário)**
- Controle de itens do inventário geral
- Categorização: oficina, mobiliário, eletrônicos, etc.
- Sistema de solicitação e aprovação
- Busca e filtros por categoria

### 🏪 **Controle de Recursos Independentes**
- Vendas de produtos (camisas, broches, cervejas, etc.)
- Sistema de doações
- Pagamentos via PIX
- Controle de estoque por variação
- Relatórios de vendas

### 💰 **Gestão Financeira**
- Solicitação de pagamentos
- Gestão de fornecedores
- Controle de projetos e orçamentos

### 👥 **Gestão de Usuários**
- Cadastro e categorização de usuários
- Grupos de trabalho
- Links úteis organizados
- Criação de eventos

## 🔐 Permissões

| Categoria | Descrição |
|-----------|----------|
| `ANY_USER` | Usuários não cadastrados (acesso básico) |
| `AMECICLISTAS` | Membros da Ameciclo |
| `PROJECT_COORDINATORS` | Coordenadores de projetos |
| `AMECICLO_COORDINATORS` | Coordenação geral |
| `RESOURCES_COORDINATOR` | Coordenador de recursos |
| `DEVELOPMENT` | Modo desenvolvimento |

## 📁 Estrutura do Projeto

```
app/
├── api/                    # Integrações externas
│   ├── cms.server.ts       # CMS Strapi
│   ├── firebaseAdmin.server.js
│   ├── firebaseConnection.server.js
│   └── googleService.ts    # Google Sheets API
├── components/             # Componentes React
│   ├── Forms/             # Formulários e inputs
│   └── [diversos].tsx     # Componentes específicos
├── handlers/              # Lógica de negócio
│   ├── actions/           # Ações do servidor
│   └── loaders/           # Carregamento de dados
├── routes/                # Páginas da aplicação
├── utils/                 # Utilitários e tipos
└── [arquivos raiz]        # Configurações Remix

public/                    # Assets estáticos
scripts/                   # Scripts de migração/população
```

## ⚙️ Instalação

**Requisitos**: Node.js >= 20.0.0

```bash
# Instalar dependências
npm i

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Popular dados iniciais (opcional)
node scripts/populate-products.js
node scripts/populate-inventario.js
```

## 🚀 Desenvolvimento

```bash
# Servidor de desenvolvimento (Telegram + Web)
npm run dev

# Modo web otimizado (apenas navegador)
npm run dev:web

# Verificar tipos
npm run typecheck

# Linting
npm run lint
```

### 🌐 Modo Web
O sistema agora suporta testes completos em navegador web comum:
- Menu de desenvolvimento automático fora do Telegram
- Simulação de diferentes tipos de usuário
- Todas as funcionalidades disponíveis
- Ver [WEB_MODE.md](WEB_MODE.md) para detalhes

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
- Configure o projeto no Firebase Console
- Ative Firestore Database
- Configure Authentication (Google)
- Adicione credenciais no `.env`

### Telegram
- Crie um bot via @BotFather
- Configure o Web App URL
- Adicione o token no `.env`

### Google Sheets (opcional)
- Configure Google Cloud Console
- Ative Sheets API
- Adicione credenciais de serviço

## 📚 Documentação Específica

- [Modo Web - Testes fora do Telegram](WEB_MODE.md)
- [Sistema de Biblioteca](BIBLIOTECA_README.md)
- [Recursos Independentes](RECURSOS_INDEPENDENTES.md)
- [Registro de Empréstimos](REGISTRO_EMPRESTIMOS_README.md)
- [Correções da Biblioteca](BIBLIOTECA_FIXES.md)
- [Testes de Desenvolvimento](DEV_TESTING.md)

## 🛠️ Scripts Utilitários

```bash
# Popular produtos para venda
node scripts/populate-products.js

# Popular inventário
node scripts/populate-inventario.js

# Migrar dados de usuários
node scripts/migrate-user-data.js
```

## 🎨 Estilização

Utiliza [Tailwind CSS](https://tailwindcss.com/) com configuração customizada para:
- Cores da identidade Ameciclo
- Componentes responsivos
- Tema escuro/claro automático
- Integração com Telegram Web App

## 🔗 Integrações

- **Telegram Web App**: Interface nativa no Telegram
- **Firebase**: Banco de dados e autenticação
- **Google Sheets**: Sincronização de dados
- **Strapi CMS**: Gestão de conteúdo
- **PIX**: Pagamentos via QR Code

## 📱 Uso

1. Acesse via bot do Telegram da Ameciclo
2. Faça login com sua conta Google (se necessário)
3. Navegue pelas funcionalidades conforme suas permissões
4. Para desenvolvimento, use o modo dev integrado

## 🤝 Contribuição

Este é um sistema interno da Ameciclo. Para contribuições:
1. Contate a coordenação técnica
2. Siga os padrões de código estabelecidos
3. Teste em modo desenvolvimento
4. Documente novas funcionalidades

## 📄 Licença

Sistema proprietário da Ameciclo - Associação Metropolitana de Ciclistas do Recife.
