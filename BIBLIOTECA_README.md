# Sistema de Biblioteca da Ameciclo

## Funcionalidades Implementadas

### 📚 **Acervo Público**
- **Visualização**: Qualquer usuário (ANY_USER) pode ver todos os livros disponíveis
- **Busca**: Pesquisa por título ou autor
- **Informações**: Título, autor, ano, tipo, categoria e disponibilidade
- **Códigos**: Sistema de códigos principais (A01, B05) e subcódigos (A01.1, A01.2)
- **Consulta Local**: Livros com subcódigo .1 ficam apenas para consulta na Ameciclo

### 🔄 **Sistema de Empréstimos**
- **Solicitação**: AMECICLISTAS podem solicitar livros disponíveis
- **Aprovação**: PROJECT_COORDINATORS aprovam solicitações e registram saídas
- **Devolução**: PROJECT_COORDINATORS registram devoluções
- **Alteração de Nome**: Possibilidade de alterar quem está levando o livro na aprovação

### 👤 **Dados Pessoais**
- **Coleta**: CPF e telefone são coletados no momento da solicitação
- **Armazenamento**: Dados salvos no campo `personal_data` dos subscribers no Firebase
- **Validação**: Verifica se usuário já possui dados antes de solicitar novamente

### 📊 **Gestão e Estatísticas**
- **Painel de Gestão**: Botão exclusivo para PROJECT_COORDINATORS
- **Livros Emprestados**: Lista com opção de registrar devolução
- **Solicitações Pendentes**: Lista para aprovar/rejeitar solicitações
- **Estatísticas Públicas**: Contabilidade de empréstimos acessível a todos

## Estrutura de Arquivos

```
app/
├── data/
│   ├── biblioteca-completa.json     # Acervo completo convertido do CSV
│   ├── emprestimos-historico.json   # Histórico de empréstimos
│   └── solicitacoes.json           # Solicitações pendentes
├── components/
│   ├── BibliotecaGestao.tsx        # Componente de gestão
│   └── FormularioDadosPessoais.tsx # Formulário para dados pessoais
├── routes/
│   ├── biblioteca.tsx              # Página principal da biblioteca
│   └── biblioteca.estatisticas.tsx # Página de estatísticas
├── handlers/
│   ├── loaders/biblioteca.ts       # Loader para dados da biblioteca
│   └── actions/biblioteca.ts       # Actions para operações
└── utils/
    ├── firebase-biblioteca.ts      # Utilitários Firebase
    └── types.ts                   # Tipos TypeScript atualizados
```

## Permissões

| Funcionalidade | ANY_USER | AMECICLISTAS | PROJECT_COORDINATORS |
|----------------|----------|--------------|---------------------|
| Ver acervo | ✅ | ✅ | ✅ |
| Buscar livros | ✅ | ✅ | ✅ |
| Solicitar empréstimo | ❌ | ✅ | ✅ |
| Ver estatísticas | ✅ | ✅ | ✅ |
| Gestão (aprovar/devolver) | ❌ | ❌ | ✅ |

## Fluxo de Empréstimo

1. **Solicitação**: AMECICLISTA clica em "Solicitar" em um livro disponível
2. **Dados Pessoais**: Se necessário, preenche CPF/telefone
3. **Aprovação**: PROJECT_COORDINATOR vê solicitação na gestão
4. **Saída**: Coordinator aprova e pode alterar nome de quem retira
5. **Empréstimo**: Livro fica marcado como emprestado
6. **Devolução**: Coordinator registra devolução quando livro volta

## Dados Convertidos

- **188 livros únicos** no acervo (convertidos do CSV)
- **104 registros** de empréstimos históricos
- Preservação do sistema de códigos existente
- Manutenção do histórico de empréstimos

## Próximas Implementações

- [ ] Integração completa com Firebase
- [ ] Notificações por Telegram
- [ ] Upload de imagens dos livros
- [ ] Campo ISBN e resumo
- [ ] Relatórios avançados
- [ ] Sistema de renovação
- [ ] Multas por atraso

## Como Usar

1. Acesse `/biblioteca` para ver o acervo
2. Use a busca para encontrar livros específicos
3. AMECICLISTAS podem clicar em "Solicitar" nos livros disponíveis
4. PROJECT_COORDINATORS acessam "Gestão" para aprovar solicitações
5. Acesse `/biblioteca/estatisticas` para ver dados públicos

O sistema mantém o histórico existente e implementa todas as funcionalidades solicitadas de forma mínima e eficiente.