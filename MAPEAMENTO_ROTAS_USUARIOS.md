# Mapeamento Completo das Rotas de Interação dos Usuários - Ameciclobot

Este documento mapeia todas as rotas e interações possíveis dos usuários no sistema Ameciclobot, organizadas por fluxo de navegação.

## 🏠 Menu Principal (/)

```mermaid
graph TD
    A[Menu Principal] --> B[Criar Evento]
    A --> C[Solicitar Pagamento]
    A --> D[Gestao de Fornecedores]
    A --> E[Biblioteca]
    A --> F[Bota pra Rodar]
    A --> G[Registro de Emprestimos]
    A --> H[Registrar Consumo]
    A --> I[Lista de Links Uteis]
    A --> J[Grupos de Trabalho]
    A --> K[Suas informacoes]
    A --> L[Boletim Informativo]
    A --> M[Gerenciamento de Usuarios]
    A --> N[Fazer Login Web]
    
    B --> B1["/criar-evento"]
    C --> C1["/solicitar-pagamento"]
    D --> D1["/gestao-fornecedores"]
    E --> E1["/biblioteca"]
    F --> F1["/bota-pra-rodar"]
    G --> G1["/registro-emprestimos"]
    H --> H1["/recursos-independentes/registrar-consumo"]
    I --> I1["/links-uteis"]
    J --> J1["/grupos-de-trabalho"]
    K --> K1["/user"]
    L --> L1["/boletim-informativo"]
    M --> M1["/users"]
    N --> N1["/login"]
```

## 📚 Sistema de Biblioteca

```mermaid
graph TD
    A[Biblioteca] --> B[Buscar Livros]
    A --> C[Estatisticas]
    A --> D[Gestao]
    A --> E[Voltar Menu]
    
    B --> B1[Filtros por Disponibilidade]
    B --> B2[Filtros por Tipo]
    B --> B3[Filtros por Ano]
    B --> B4[Solicitar Emprestimo]
    
    B4 --> B4A["/solicitar-emprestimo"]
    B4A --> B4A1["/sucesso/emprestimo-solicitado"]
    
    C --> C1["/estatisticas-biblioteca"]
    C1 --> C1A[Voltar Biblioteca]
    
    D --> D1["/biblioteca?gestao=true"]
    D1 --> D1A[Aprovar Solicitacoes]
    D1 --> D1B[Gerenciar Emprestimos]
    D1 --> D1C[Registrar Devolucao]
    D1 --> D1D[Voltar Biblioteca]
    
    E --> E1["/"]
```

## 🚴 Bota pra Rodar

```mermaid
graph TD
    A[Bota pra Rodar] --> B[Buscar Bicicletas]
    A --> C[Estatisticas]
    A --> D[Gestao]
    A --> E[Voltar Menu]
    
    B --> B1[Filtros por Disponibilidade]
    B --> B2[Filtros por Tipo]
    B --> B3[Solicitar Emprestimo]
    
    B3 --> B3A["/solicitar-emprestimo-bicicleta"]
    B3A --> B3A1["/sucesso/emprestimo-bicicleta-solicitado"]
    
    C --> C1["/estatisticas-bota-pra-rodar"]
    C1 --> C1A[Voltar Bota pra Rodar]
    
    D --> D1["/bota-pra-rodar?gestao=true"]
    D1 --> D1A[Aprovar Solicitacoes]
    D1 --> D1B[Gerenciar Emprestimos]
    D1 --> D1C[Registrar Devolucao]
    D1 --> D1D[Voltar Bota pra Rodar]
    
    E --> E1["/"]
```

## 📦 Registro de Empréstimos (Inventário)

```mermaid
graph TD
    A[Registro Emprestimos] --> B[Buscar Itens]
    A --> C[Gestao]
    A --> D[Voltar Menu]
    
    B --> B1[Filtros por Disponibilidade]
    B --> B2[Filtros por Categoria]
    B --> B3[Solicitar Emprestimo]
    
    B3 --> B3A["/solicitar-emprestimo-inventario"]
    B3A --> B3A1["/sucesso/emprestimo-inventario-solicitado"]
    
    C --> C1["/registro-emprestimos?gestao=true"]
    C1 --> C1A[Aprovar Solicitacoes]
    C1 --> C1B[Gerenciar Emprestimos]
    C1 --> C1C[Registrar Devolucao]
    C1 --> C1D[Voltar Registro]
    
    D --> D1["/"]
```

## 🛒 Recursos Independentes

```mermaid
graph TD
    A[Registrar Consumo] --> B[Registrar Consumo Proprio]
    A --> C[Registrar Consumo Alheio]
    A --> D[Registrar Doacao Propria]
    A --> E[Registrar Doacao Alheia]
    A --> F[Meus Consumos]
    A --> G[Historico]
    A --> H[Gestao]
    A --> I[Voltar Menu]
    
    B --> B1[Selecionar Produto]
    B1 --> B2[Selecionar Variacao]
    B2 --> B3[Definir Quantidade]
    B3 --> B4[Confirmar Compra]
    B4 --> B5["/recursos-independentes/meus-consumos?success=true"]
    
    C --> C1[Informar Nome Cliente]
    C1 --> B1
    
    D --> D1[Informar Valor Doacao]
    D1 --> D2[Confirmar Doacao]
    D2 --> D3["/recursos-independentes/meus-consumos?success=donation"]
    
    E --> E1[Informar Nome Doador]
    E1 --> D1
    
    F --> F1["/recursos-independentes/meus-consumos"]
    F1 --> F1A[Aba Consumos]
    F1 --> F1B[Aba Doacoes]
    F1A --> F1A1[Marcar como Pago]
    F1A --> F1A2[Cancelar]
    F1B --> F1B1[Marcar como Pago]
    F1B --> F1B2[Cancelar]
    
    G --> G1["/recursos-independentes/historico"]
    G1 --> G1A[Aba Resumo]
    G1 --> G1B[Aba Vendas]
    G1 --> G1C[Aba Doacoes]
    G1 --> G1D[Filtros por Periodo]
    
    H --> H1["/recursos-independentes/gerenciar?gestao=true"]
    H1 --> H1A[Aba Pendentes]
    H1 --> H1B[Aba Confirmados]
    H1 --> H1C[Aba Produtos]
    H1 --> H1D[Aba Criar Produto]
    H1A --> H1A1[Confirmar Venda Doacao]
    H1A --> H1A2[Rejeitar Venda Doacao]
    H1C --> H1C1[Editar Produto]
    H1C --> H1C2[Remover Produto]
    H1D --> H1D1[Criar Novo Produto]
    H1D --> H1D2[Atualizar Produto Existente]
    
    I --> I1["/"]
```

## ⚙️ Informações do Usuário

```mermaid
graph TD
    A[Suas Informacoes] --> B[Ver Informacoes Telegram]
    A --> C[Editar Informacoes Pessoais]
    A --> D[Cadastrar no Sistema]
    A --> E[Voltar Menu]
    
    B --> B1[Nome Usuario ID Permissao]
    
    C --> C1[Formulario de Edicao]
    C1 --> C1A[Campo Email]
    C1 --> C1B[Campo CPF]
    C1 --> C1C[Campo Telefone]
    C1 --> C1D[Salvar Informacoes]
    C1 --> C1E[Cancelar]
    C1D --> C1F[Sucesso Voltar Visualizacao]
    C1E --> B1
    
    D --> D1[Botao CADASTRAR]
    D1 --> D2[Sucesso Usuario Cadastrado]
    
    E --> E1["/"]
```

## 🔑 Sistema de Login Web

```mermaid
graph TD
    A[Login] --> B[Inserir Email]
    A --> C[Ja Logado]
    
    B --> B1[Enviar Link Acesso]
    B1 --> B2[Email Enviado Aguardar]
    B2 --> B3[Clicar Link no Email]
    B3 --> B4["/auth/verify?token=..."]
    B4 --> B5[Login Realizado]
    B5 --> B6[Redirect para raiz]
    
    C --> C1[Redirect para raiz]
```

## 🔗 Links Úteis

```mermaid
graph TD
    A[Links Uteis] --> B[Site da Ameciclo]
    A --> C[Plataforma de Dados]
    A --> D[Biciclopedia]
    A --> E[Drive da Ameciclo]
    A --> F[Ver pautas para RO]
    A --> G[Acompanhar nossos gastos]
    A --> H[Ocupar a sede]
    A --> I[Requisitar equipamento]
    A --> J[Eventos Internos]
    A --> K[Eventos Externos]
    A --> L[Organizacional]
    A --> M[Divulgacao de eventos]
    A --> N[Voltar Menu]
    
    B --> B1["https://ameciclo.org"]
    C --> C1["http://dados.ameciclo.org/"]
    D --> D1["http://biciclopedia.ameciclo.org/"]
    E --> E1["http://drive.ameciclo.org/"]
    F --> F1["http://pautas.ameciclo.org/"]
    G --> G1["http://transparencia.ameciclo.org/"]
    H --> H1["http://ocupe.ameciclo.org/"]
    I --> I1["http://equipamento.ameciclo.org/"]
    J --> J1["http://internos.ameciclo.org/"]
    K --> K1["http://externos.ameciclo.org/"]
    L --> L1["http://organizacional.ameciclo.org/"]
    M --> M1["http://divulgacao.ameciclo.org/"]
    
    N --> N1["/"]
```

## 📊 Estatísticas da Biblioteca

```mermaid
graph TD
    A[Estatisticas Biblioteca] --> B[Cards de Resumo]
    A --> C[Livro Mais Querido]
    A --> D[Longo pra Ler]
    A --> E[Livros Mais Emprestados]
    A --> F[Emprestimos por Mes]
    A --> G[Voltar Biblioteca]
    
    B --> B1[Total de Emprestimos]
    B --> B2[Titulos Diferentes]
    B --> B3[Devolvidos]
    B --> B4[A Receber]
    B --> B5[Pessoas Beneficiadas]
    B --> B6[Tempo Medio]
    B --> B7[Tempo Minimo]
    B --> B8[Tempo Maximo]
    
    G --> G1["/biblioteca"]
```

## 📧 Boletim Informativo (Coordenadores)

```mermaid
graph TD
    A[Boletim Informativo] --> B[Criar Conteudo]
    A --> C[Ver Conteudo]
    A --> D[Voltar Menu]
    
    B --> B1["/boletim-informativo/content"]
    B1 --> B1A[Editor de Conteudo]
    B1A --> B1A1[Salvar Rascunho]
    B1A --> B1A2[Publicar]
    B1A --> B1A3[Voltar]
    B1A3 --> A
    
    C --> C1[Visualizar Newsletter]
    C1 --> C1A[Voltar]
    C1A --> A
    
    D --> D1["/"]
```

## 🔧 Gerenciamento de Usuários (Coordenadores)

```mermaid
graph TD
    A[Gerenciamento Usuarios] --> B[Lista de Usuarios]
    A --> C[Filtros e Busca]
    A --> D[Voltar Menu]
    
    B --> B1[Editar Permissoes]
    B --> B2[Ver Detalhes]
    B --> B3[Remover Usuario]
    
    C --> C1[Filtro por Categoria]
    C --> C2[Busca por Nome]
    
    D --> D1["/"]
```

## 💰 Gestão Financeira

```mermaid
graph TD
    A[Solicitar Pagamento] --> B[Formulario de Solicitacao]
    A --> C[Voltar Menu]
    
    B --> B1[Informacoes do Pagamento]
    B1 --> B2[Enviar Solicitacao]
    B2 --> B3[Confirmacao de Envio]
    
    C --> C1["/"]
    
    D[Gestao Fornecedores] --> E[Lista de Fornecedores]
    D --> F[Adicionar Fornecedor]
    D --> G[Voltar Menu]
    
    E --> E1[Editar Fornecedor]
    E --> E2[Remover Fornecedor]
    E1 --> E1A["/sucesso/editar-fornecedor"]
    E2 --> E2A["/sucesso/remover-fornecedor"]
    
    F --> F1[Formulario Novo Fornecedor]
    F1 --> F2[Salvar Fornecedor]
    F2 --> F3[Confirmacao]
    
    G --> G1["/"]
```

## 📅 Criar Evento

```mermaid
graph TD
    A[Criar Evento] --> B[Formulario de Evento]
    A --> C[Voltar Menu]
    
    B --> B1[Informacoes Basicas]
    B --> B2[Data e Horario]
    B --> B3[Local]
    B --> B4[Descricao]
    B --> B5[Criar Evento]
    B5 --> B6[Confirmacao de Criacao]
    
    C --> C1["/"]
```

## 👥 Grupos de Trabalho

```mermaid
graph TD
    A[Grupos de Trabalho] --> B[Lista de Grupos]
    A --> C[Voltar Menu]
    
    B --> B1[Ver Detalhes do Grupo]
    B --> B2[Participar do Grupo]
    B --> B3[Sair do Grupo]
    
    C --> C1["/"]
```

## 🚫 Páginas de Erro e Sucesso

```mermaid
graph TD
    A[Unauthorized] --> B[Mensagem de Acesso Negado]
    B --> B1[Voltar Menu]
    B1 --> B2["/"]
    
    C[Sucesso Generico] --> D[Mensagem de Sucesso]
    D --> D1[Voltar Menu]
    D1 --> D2["/"]
    
    E[Logout] --> F[Deslogar Usuario]
    F --> F1[Redirect para raiz]
```

## 🔐 Controle de Permissões por Rota

| Rota | Permissão Mínima | Observações |
|------|------------------|-------------|
| `/` | ANY_USER | Menu principal |
| `/biblioteca` | ANY_USER | Acesso público ao acervo |
| `/biblioteca?gestao=true` | PROJECT_COORDINATORS | Gestão de empréstimos |
| `/bota-pra-rodar` | ANY_USER | Visualização pública |
| `/bota-pra-rodar?gestao=true` | PROJECT_COORDINATORS | Gestão de bicicletas |
| `/registro-emprestimos` | AMECICLISTAS | Acesso ao inventário |
| `/registro-emprestimos?gestao=true` | PROJECT_COORDINATORS | Gestão do inventário |
| `/recursos-independentes/*` | AMECICLISTAS | Sistema de vendas |
| `/recursos-independentes/gerenciar` | PROJECT_COORDINATORS | Gestão de vendas |
| `/user` | ANY_USER | Informações pessoais |
| `/login` | ANY_USER | Login web |
| `/links-uteis` | ANY_USER | Links públicos e internos |
| `/criar-evento` | AMECICLISTAS | Criação de eventos |
| `/solicitar-pagamento` | PROJECT_COORDINATORS | Solicitações financeiras |
| `/gestao-fornecedores` | PROJECT_COORDINATORS | Gestão de fornecedores |
| `/boletim-informativo` | AMECICLO_COORDINATORS | Newsletter |
| `/users` | AMECICLO_COORDINATORS | Gestão de usuários |
| `/grupos-de-trabalho` | AMECICLISTAS | Grupos internos |
| `/estatisticas-*` | ANY_USER | Estatísticas públicas |

## 🔄 Fluxos de Navegação Principais

### 1. Usuário Visitante (ANY_USER)
```
Menu → Biblioteca → Buscar/Filtrar → Visualizar Livros
Menu → Bota pra Rodar → Visualizar Bicicletas  
Menu → Links Úteis → Acessar Links Externos
Menu → Suas Informações → Ver/Editar Dados
Menu → Login → Autenticar via Email
```

### 2. Ameciclista (AMECICLISTAS)
```
Menu → Biblioteca → Solicitar Empréstimo → Sucesso
Menu → Registro Empréstimos → Solicitar Item → Sucesso
Menu → Recursos Independentes → Registrar Consumo → Meus Consumos
Menu → Criar Evento → Formulário → Confirmação
Menu → Grupos de Trabalho → Participar
```

### 3. Coordenador de Projeto (PROJECT_COORDINATORS)
```
Menu → Biblioteca → Gestão → Aprovar/Gerenciar Empréstimos
Menu → Recursos Independentes → Gestão → Confirmar Vendas/Doações
Menu → Solicitar Pagamento → Formulário → Envio
Menu → Gestão Fornecedores → CRUD Fornecedores
```

### 4. Coordenador Ameciclo (AMECICLO_COORDINATORS)
```
Menu → Boletim Informativo → Criar/Editar Newsletter
Menu → Gerenciamento Usuários → Gerenciar Permissões
Menu → [Todas as funcionalidades anteriores]
```

## 📱 Considerações de Interface

- **Telegram Web App**: Interface otimizada para Telegram
- **Web Browser**: Interface completa com login por email
- **Modo Desenvolvimento**: Simulação de usuários e permissões
- **Responsividade**: Adaptação para mobile e desktop
- **Navegação**: Botões "Voltar" em todas as páginas
- **Feedback**: Mensagens de sucesso/erro após ações
- **Filtros**: Busca e filtros em listagens extensas
- **Paginação**: Para grandes volumes de dados

Este mapeamento representa o estado atual do sistema e pode ser usado como referência para desenvolvimento, testes e documentação de novas funcionalidades.