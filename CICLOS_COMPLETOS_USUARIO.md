# Ciclos Completos do Usuário - Biblioteca e Bota pra Rodar

Este documento mapeia os ciclos completos de interação dos usuários nos sistemas de Biblioteca e Bota pra Rodar, desde o acesso inicial até a conclusão do empréstimo.

## 📚 Ciclo Completo - Sistema de Biblioteca

### 🔄 Fluxo do Usuário Comum (Empréstimo)

```mermaid
flowchart TD
    A[Usuario acessa Menu Principal] --> B[Clica em Biblioteca]
    B --> C[Carrega pagina /biblioteca]
    C --> D{Usuario esta logado?}
    
    D -->|Nao| E[Visualiza acervo publico]
    D -->|Sim| F[Visualiza acervo + opcao solicitar]
    
    E --> G[Busca por titulo/autor]
    F --> G
    G --> H[Aplica filtros disponibilidade/tipo/ano]
    H --> I[Encontra livro desejado]
    
    I --> J{Livro disponivel?}
    J -->|Nao| K[Ve status: Emprestado/Consulta local]
    J -->|Sim| L{Usuario e AMECICLISTA?}
    
    K --> M[Volta para busca]
    L -->|Nao| N[Apenas visualizacao]
    L -->|Sim| O[Botao Solicitar Emprestimo aparece]
    
    N --> M
    O --> P[Clica Solicitar Emprestimo]
    P --> Q[Redireciona /solicitar-emprestimo]
    Q --> R[Preenche formulario solicitacao]
    R --> S[Envia solicitacao]
    S --> T[Redireciona /sucesso/emprestimo-solicitado]
    T --> U[Mensagem: Aguarde aprovacao coordenador]
    
    U --> V[Usuario aguarda notificacao]
    V --> W{Coordenador aprova?}
    W -->|Nao| X[Solicitacao rejeitada]
    W -->|Sim| Y[Emprestimo aprovado]
    
    X --> Z[Usuario recebe notificacao rejeicao]
    Y --> AA[Usuario recebe notificacao aprovacao]
    AA --> BB[Usuario retira livro na sede]
    BB --> CC[Emprestimo ativo - prazo 30 dias]
    
    CC --> DD{Usuario devolve no prazo?}
    DD -->|Sim| EE[Devolve na sede]
    DD -->|Nao| FF[Emprestimo em atraso]
    
    EE --> GG[Coordenador registra devolucao]
    FF --> HH[Coordenador entra em contato]
    HH --> II[Usuario devolve com atraso]
    II --> GG
    
    GG --> JJ[Emprestimo finalizado]
    JJ --> KK[Livro volta ao acervo disponivel]
    KK --> LL[Ciclo completo]
```

### 🔧 Fluxo do Coordenador (Gestão)

```mermaid
flowchart TD
    A[Coordenador acessa Menu] --> B[Clica Biblioteca]
    B --> C[Clica botao Gestao]
    C --> D[Acessa /biblioteca?gestao=true]
    D --> E[Ve painel de gestao]
    
    E --> F[Aba Solicitacoes Pendentes]
    E --> G[Aba Emprestimos Ativos]
    E --> H[Aba Historico]
    
    F --> I{Tem solicitacoes?}
    I -->|Nao| J[Lista vazia]
    I -->|Sim| K[Lista solicitacoes com detalhes]
    
    K --> L[Ve: Usuario, Livro, Data, Justificativa]
    L --> M{Decisao do coordenador}
    M -->|Aprovar| N[Clica Aprovar]
    M -->|Rejeitar| O[Clica Rejeitar]
    
    N --> P[Emprestimo criado no sistema]
    P --> Q[Usuario notificado para retirada]
    O --> R[Solicitacao cancelada]
    R --> S[Usuario notificado da rejeicao]
    
    G --> T[Lista emprestimos em andamento]
    T --> U[Ve: Usuario, Livro, Data emprestimo, Prazo]
    U --> V{Emprestimo em atraso?}
    V -->|Sim| W[Destacado em vermelho]
    V -->|Nao| X[Status normal]
    
    W --> Y[Coordenador entra em contato]
    X --> Z[Aguarda devolucao natural]
    Y --> AA[Usuario devolve livro]
    Z --> AA
    
    AA --> BB[Coordenador clica Registrar Devolucao]
    BB --> CC[Emprestimo finalizado no sistema]
    CC --> DD[Livro volta status disponivel]
    
    H --> EE[Historico completo emprestimos]
    EE --> FF[Filtros por periodo/usuario/status]
    FF --> GG[Relatorios e estatisticas]
```

## 🚴 Ciclo Completo - Sistema Bota pra Rodar

### 🔄 Fluxo do Usuário Comum (Empréstimo de Bicicleta)

```mermaid
flowchart TD
    A[Usuario acessa Menu Principal] --> B[Clica em Bota pra Rodar]
    B --> C[Carrega pagina /bota-pra-rodar]
    C --> D{Usuario esta logado?}
    
    D -->|Nao| E[Visualiza bicicletas publico]
    D -->|Sim| F[Visualiza bicicletas + opcao solicitar]
    
    E --> G[Busca por nome/codigo]
    F --> G
    G --> H[Aplica filtros disponibilidade/tipo]
    H --> I[Encontra bicicleta desejada]
    
    I --> J{Bicicleta disponivel?}
    J -->|Nao| K[Ve status: Emprestada]
    J -->|Sim| L{Usuario e AMECICLISTA?}
    
    K --> M[Volta para busca]
    L -->|Nao| N[Apenas visualizacao]
    L -->|Sim| O[Botao Solicitar Emprestimo aparece]
    
    N --> M
    O --> P[Clica Solicitar Emprestimo]
    P --> Q[Redireciona /solicitar-emprestimo-bicicleta]
    Q --> R[Preenche formulario detalhado]
    
    R --> S[Informa: Periodo, Justificativa, Experiencia]
    S --> T[Envia solicitacao]
    T --> U[Redireciona /sucesso/emprestimo-bicicleta-solicitado]
    U --> V[Mensagem: Aguarde aprovacao coordenador]
    
    V --> W[Usuario aguarda notificacao]
    W --> X{Coordenador aprova?}
    X -->|Nao| Y[Solicitacao rejeitada]
    X -->|Sim| Z[Emprestimo aprovado]
    
    Y --> AA[Usuario recebe notificacao rejeicao]
    Z --> BB[Usuario recebe notificacao aprovacao]
    BB --> CC[Agendamento para retirada]
    CC --> DD[Usuario retira bicicleta na sede]
    
    DD --> EE[Coordenador faz checklist bicicleta]
    EE --> FF[Registra condicoes iniciais]
    FF --> GG[Emprestimo ativo - prazo acordado]
    
    GG --> HH{Usuario devolve no prazo?}
    HH -->|Sim| II[Devolve na sede]
    HH -->|Nao| JJ[Emprestimo em atraso]
    
    II --> KK[Coordenador faz checklist devolucao]
    JJ --> LL[Coordenador entra em contato]
    LL --> MM[Usuario devolve com atraso]
    MM --> KK
    
    KK --> NN{Bicicleta em bom estado?}
    NN -->|Sim| OO[Registra devolucao normal]
    NN -->|Nao| PP[Registra danos/manutencao]
    
    OO --> QQ[Bicicleta volta ao acervo]
    PP --> RR[Bicicleta vai para manutencao]
    RR --> SS[Apos reparo volta ao acervo]
    
    QQ --> TT[Ciclo completo]
    SS --> TT
```

### 🔧 Fluxo do Coordenador (Gestão de Bicicletas)

```mermaid
flowchart TD
    A[Coordenador acessa Menu] --> B[Clica Bota pra Rodar]
    B --> C[Clica botao Gestao]
    C --> D[Acessa /bota-pra-rodar?gestao=true]
    D --> E[Ve painel de gestao]
    
    E --> F[Aba Solicitacoes Pendentes]
    E --> G[Aba Emprestimos Ativos]
    E --> H[Aba Manutencao]
    E --> I[Aba Historico]
    
    F --> J{Tem solicitacoes?}
    J -->|Nao| K[Lista vazia]
    J -->|Sim| L[Lista solicitacoes detalhadas]
    
    L --> M[Ve: Usuario, Bicicleta, Periodo, Justificativa]
    M --> N[Avalia experiencia do usuario]
    N --> O{Decisao do coordenador}
    O -->|Aprovar| P[Clica Aprovar]
    O -->|Rejeitar| Q[Clica Rejeitar + motivo]
    
    P --> R[Emprestimo pre-aprovado]
    R --> S[Agenda retirada com usuario]
    Q --> T[Solicitacao rejeitada]
    T --> U[Usuario notificado com motivo]
    
    S --> V[Usuario comparece para retirada]
    V --> W[Coordenador faz checklist]
    W --> X[Verifica: Pneus, freios, corrente, etc]
    X --> Y[Registra estado inicial]
    Y --> Z[Entrega bicicleta ao usuario]
    Z --> AA[Emprestimo oficialmente ativo]
    
    G --> BB[Lista emprestimos em andamento]
    BB --> CC[Ve detalhes: Usuario, bicicleta, prazo]
    CC --> DD{Emprestimo vencendo?}
    DD -->|Sim| EE[Envia lembrete ao usuario]
    DD -->|Nao| FF[Monitora normalmente]
    
    EE --> GG{Usuario devolve?}
    FF --> GG
    GG -->|Sim| HH[Usuario traz bicicleta]
    GG -->|Nao| II[Emprestimo em atraso]
    
    HH --> JJ[Coordenador faz checklist devolucao]
    II --> KK[Contata usuario]
    KK --> LL[Usuario devolve com atraso]
    LL --> JJ
    
    JJ --> MM[Compara estado inicial vs final]
    MM --> NN{Detecta problemas?}
    NN -->|Nao| OO[Registra devolucao OK]
    NN -->|Sim| PP[Registra danos encontrados]
    
    OO --> QQ[Bicicleta disponivel novamente]
    PP --> RR[Bicicleta marcada para manutencao]
    
    H --> SS[Aba Manutencao]
    SS --> TT[Lista bicicletas com problemas]
    TT --> UU[Coordenador agenda reparo]
    UU --> VV[Apos manutencao testa bicicleta]
    VV --> WW[Marca como disponivel]
    WW --> QQ
    
    I --> XX[Historico completo]
    XX --> YY[Relatorios de uso]
    YY --> ZZ[Estatisticas de emprestimos]
```

## 📊 Comparação dos Ciclos

| Aspecto | Biblioteca | Bota pra Rodar |
|---------|------------|-----------------|
| **Complexidade** | Média | Alta |
| **Checklist Físico** | Não | Sim (retirada + devolução) |
| **Prazo Padrão** | 30 dias | Variável (acordado) |
| **Manutenção** | Não aplicável | Essencial |
| **Agendamento** | Não | Sim (retirada) |
| **Estado do Item** | Não verificado | Verificado sempre |
| **Notificações** | Básicas | Detalhadas |
| **Aprovação** | Simples | Criteriosa |

## 🔄 Pontos de Integração

### 📱 Notificações do Sistema
- Aprovação/rejeição de solicitações
- Lembretes de vencimento
- Confirmações de devolução

### 👥 Interação Coordenador-Usuário
- Comunicação via Telegram
- Agendamentos presenciais
- Orientações de uso

### 📈 Dados Gerados
- Estatísticas de uso
- Relatórios de empréstimos
- Histórico de manutenções (bicicletas)

Este mapeamento mostra como cada sistema tem suas particularidades, sendo o Bota pra Rodar mais complexo devido à natureza física e valor dos itens emprestados.