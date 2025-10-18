# Fluxo Detalhado - Solicitação de Empréstimo

Este documento detalha o processo real de solicitação de empréstimo baseado no código implementado, mostrando as diferenças entre tipos de usuário e validações necessárias.

## 📚 Fluxo Detalhado - Biblioteca

### 🔄 Processo Completo de Solicitação

```mermaid
flowchart TD
    A[Usuario clica Solicitar Emprestimo] --> B[Sistema verifica usuario logado]
    B --> C{Usuario identificado?}
    
    C -->|Nao| D[Erro: Usuario nao identificado]
    C -->|Sim| E[Carrega /solicitar-emprestimo]
    
    E --> F[Sistema busca dados do usuario no Firebase]
    F --> G[Verifica: userRole e hasLibraryRegister]
    
    G --> H{Tipo de usuario?}
    H -->|Qualquer usuario sem cadastro| I[Redireciona automaticamente para /user]
    H -->|Usuario com cadastro completo| J{E coordenador?}
    
    I --> L[Pagina /user com aviso sobre cadastro]
    L --> M[Usuario completa dados pessoais]
    M --> N[Volta para solicitar emprestimo]
    N --> J
    
    J -->|Nao| K[Permite solicitacao]
    J -->|Sim| O{Coordenador escolhe opcao}
    O -->|Para mim| K
    O -->|Para outra pessoa| P[Redireciona /registrar-usuario]
    
    K --> Q[Mostra exemplares disponiveis]
    P --> PP[Fluxo de cadastro terceiros]
    Q --> R[Filtra: Remove .1 consulta local]
    R --> S{Tem exemplares disponiveis?}
    
    S -->|Nao| T[Mensagem: Nenhum exemplar disponivel]
    S -->|Sim| U[Usuario seleciona exemplar]
    
    U --> V[Preenche formulario]
    V --> W[Envia solicitacao]
    W --> X[Sistema salva em biblioteca_solicitacoes]
    X --> Y[Status: pendente]
    Y --> Z[Redireciona /sucesso/emprestimo-solicitado]
    
    T --> AA[Volta para biblioteca]
    Z --> BB[Aguarda aprovacao coordenador]
```

### 🔧 Fluxo do Coordenador para Terceiros

```mermaid
flowchart TD
    A[Coordenador escolhe solicitar para outra pessoa] --> B[Acessa /registrar-usuario]
    B --> C[Busca por CPF]
    
    C --> D{Usuario encontrado?}
    D -->|Sim| E[Mostra dados do usuario]
    D -->|Nao| F[Formulario novo usuario]
    
    E --> G[Confirma dados corretos]
    G --> H[Cria solicitacao para usuario existente]
    
    F --> I[Preenche: Nome, CPF, Telefone, Email]
    I --> J[Cria usuario com ID: cpf_numeroscpf]
    J --> K[Salva em ameciclo_register]
    K --> L[Cria solicitacao automaticamente]
    
    H --> M[Solicitacao registrada]
    L --> M
    M --> N[Sucesso: Usuario e solicitacao criados]
```

## 🚴 Fluxo Detalhado - Bota pra Rodar

### 🔄 Processo Completo de Solicitação

```mermaid
flowchart TD
    A[Usuario clica Solicitar Emprestimo] --> B[Carrega /solicitar-emprestimo-bicicleta]
    B --> C[Sistema verifica usuario logado]
    
    C --> D{Usuario identificado?}
    D -->|Nao| E[Erro: Precisa estar logado]
    D -->|Sim| F[Busca dados do usuario]
    
    F --> G[Verifica cadastro completo]
    G --> H{Tem CPF cadastrado?}
    
    H -->|Nao| I[Redireciona automaticamente para /user]
    H -->|Sim| J[Verifica tipo de usuario]
    
    I --> K[Pagina /user com aviso sobre cadastro]
    K --> L[Usuario completa cadastro]
    L --> M[Volta para solicitar bicicleta]
    
    J --> N{Tipo de usuario?}
    N -->|PROJECT_COORDINATORS| O{Coordenador escolhe opcao}
    N -->|AMECICLO_COORDINATORS| O
    N -->|Outros| P[Solicitacao para aprovacao]
    
    O -->|Para mim| Q[Aprovacao automatica]
    O -->|Para outra pessoa| PP[Redireciona /registrar-usuario]
    
    Q --> R[Cria emprestimo direto]
    R --> S[Status: emprestado]
    S --> T[Redireciona /sucesso?approved=true]
    
    P --> U[Cria solicitacao]
    U --> V[Status: pendente]
    V --> W[Redireciona /sucesso/emprestimo-bicicleta-solicitado]
    
    PP --> XX[Fluxo de cadastro terceiros]
    
    T --> Y[Mensagem: Emprestimo aprovado]
    W --> Z[Mensagem: Aguarde aprovacao]
```

### 🔧 Fluxo do Coordenador para Terceiros

```mermaid
flowchart TD
    A[Coordenador escolhe solicitar para outra pessoa] --> B[Acessa /registrar-usuario]
    B --> C[Busca por CPF]
    
    C --> D{Usuario encontrado?}
    D -->|Sim| E[Mostra dados do usuario]
    D -->|Nao| F[Formulario novo usuario]
    
    E --> G[Confirma dados corretos]
    G --> H[Cria solicitacao para usuario existente]
    
    F --> I[Preenche: Nome, CPF, Telefone, Email]
    I --> J[Cria usuario com ID: cpf_numeroscpf]
    J --> K[Salva em ameciclo_register]
    K --> L[Cria solicitacao automaticamente]
    
    H --> M[Solicitacao registrada]
    L --> M
    M --> N[Sucesso: Usuario e solicitacao criados]
```

## 🔐 Matriz de Permissões e Validações

| Tipo de Usuário | Biblioteca | Bota pra Rodar | Cadastro Obrigatório | Aprovação |
|------------------|------------|-----------------|---------------------|-----------|
| **ANY_USER** | ✅ Com cadastro | ✅ Com cadastro | ✅ Sim | Manual |
| **AMECICLISTAS** | ✅ Com cadastro | ✅ Com cadastro | ✅ Sim | Manual |
| **PROJECT_COORDINATORS** | ✅ Com cadastro | ✅ Com cadastro | ✅ Sim | Automática (bicicletas) |
| **AMECICLO_COORDINATORS** | ✅ Com cadastro | ✅ Com cadastro | ✅ Sim | Automática (bicicletas) |

## 📋 Validações por Sistema

### 📚 Biblioteca
```javascript
// Verificações no código
const needsLibraryRegister = user && !hasLibraryRegister && 
  (userRole === 'ANY_USER' || userRole === 'AMECICLISTAS');

const isCoordinator = userRole === 'PROJECT_COORDINATORS' || 
  userRole === 'AMECICLO_COORDINATORS';

const actuallyNeedsRegister = needsLibraryRegister && !isCoordinator;
```

### 🚴 Bota pra Rodar
```javascript
// Verificações no código
const userData = getUserData();
const needsRegister = !userData || userData.cpf === 'Não informado';

const isCoordinator = isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS);
```

## 🔄 Estados da Solicitação

### 📚 Biblioteca
1. **pendente** → Aguardando aprovação do coordenador
2. **aprovado** → Coordenador aprovou, usuário pode retirar
3. **emprestado** → Livro foi retirado
4. **devolvido** → Livro foi devolvido
5. **rejeitado** → Coordenador rejeitou a solicitação

### 🚴 Bota pra Rodar
1. **pendente** → Aguardando aprovação (usuários comuns)
2. **emprestado** → Aprovado automaticamente (coordenadores)
3. **devolvido** → Bicicleta foi devolvida
4. **rejeitado** → Coordenador rejeitou

## 📊 Diferenças Principais

| Aspecto | Biblioteca | Bota pra Rodar |
|---------|------------|----------------|
| **Cadastro** | Obrigatório para todos | Obrigatório para todos |
| **Aprovação Coordenador** | Manual sempre | Automática para coordenadores |
| **Validação CPF** | Flexível | Obrigatória |
| **Solicitação Terceiros** | Via registrar-usuario | Via registrar-usuario |
| **Exemplares** | Filtra .1 (consulta local) | Não aplicável |

## 🚨 Pontos Críticos de Validação

### 1. **Identificação do Usuário**
- Telegram ID obrigatório
- Fallback para modo desenvolvimento

### 2. **Cadastro Completo**
- **TODOS os usuários**: obrigatório (CPF, email, telefone)
- **Simplificação**: Redirecionamento automático para `/user`

### 3. **Disponibilidade do Item**
- Biblioteca: verifica exemplares não .1
- Bicicleta: verifica disponibilidade geral

### 4. **Permissões Especiais**
- Coordenadores têm aprovação automática (apenas bicicletas)
- Coordenadores podem escolher "para mim" ou "para outra pessoa"
- Fluxo de terceiros via `/registrar-usuario`

### 5. **Fluxo Simplificado**
- Usuário comum: sempre redireciona para `/user` se cadastro incompleto
- Coordenadores: usam rota específica para terceiros
- Menos passos e opções confusas

Este fluxo detalhado mostra que o sistema tem validações robustas baseadas no tipo de usuário e no completude do cadastro, com tratamentos especiais para coordenadores que podem tanto ter aprovação automática quanto solicitar para outras pessoas.