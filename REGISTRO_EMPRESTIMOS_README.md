# Sistema de Registro de Empréstimos - Inventário Ameciclo

## Visão Geral

O Sistema de Registro de Empréstimos é uma funcionalidade que permite o controle de empréstimos de itens do inventário da Ameciclo. É baseado no sistema "Bota pra Rodar" mas adaptado para qualquer item do inventário da organização.

## Funcionalidades

### Controle de Acesso
- **AMECICLISTAS**: Podem visualizar itens e solicitar empréstimos
- **PROJECT_COORDINATORS**: Podem aprovar/rejeitar solicitações, registrar devoluções e cadastrar novos itens
- **Aprovação Automática**: PROJECT_COORDINATORS têm suas solicitações aprovadas automaticamente

### Gestão de Itens
- Cadastro de novos itens do inventário
- Categorização por: oficina mecânica, caixotes, mobiliário, equipamentos eletrônicos, equipamentos elétricos, equipamentos em geral
- Subcategorização e detalhamento dos itens
- Controle de disponibilidade automático

### Sistema de Empréstimos
- Solicitação de empréstimo por AMECICLISTAS
- Aprovação/rejeição por PROJECT_COORDINATORS
- Registro de devolução apenas por PROJECT_COORDINATORS
- Histórico completo de empréstimos

### Interface
- Busca por nome, código ou categoria
- Filtros por disponibilidade e categoria
- Paginação para melhor performance
- Interface responsiva

## Estrutura do Banco de Dados (Firebase)

### Coleções Principais

#### `inventario/`
```json
{
  "codigo_item": {
    "codigo": "01",
    "nome": "Oficina mecânica",
    "categoria": "oficina mecânica",
    "subcategoria": "",
    "detalhamento": "Link para planilha...",
    "descricao": "",
    "disponivel": true,
    "emprestado": false
  }
}
```

#### `emprestimos_inventario/`
```json
{
  "emprestimo_id": {
    "id": "emprestimo_id",
    "usuario_id": 123456789,
    "codigo_item": "01",
    "data_saida": "2024-01-15",
    "data_devolucao": "2024-01-20",
    "status": "emprestado" // ou "devolvido"
  }
}
```

#### `solicitacoes_inventario/`
```json
{
  "solicitacao_id": {
    "id": "solicitacao_id",
    "usuario_id": 123456789,
    "codigo_item": "01",
    "data_solicitacao": "2024-01-15",
    "status": "pendente" // ou "aprovada", "rejeitada"
  }
}
```

## Arquivos Principais

### Rotas
- `/app/routes/registro-emprestimos.tsx` - Página principal
- `/app/routes/solicitar-emprestimo-inventario.tsx` - Solicitação de empréstimo
- `/app/routes/sucesso.emprestimo-inventario-solicitado.tsx` - Página de sucesso

### Handlers
- `/app/handlers/loaders/registro-emprestimos.ts` - Carregamento de dados
- `/app/handlers/actions/registro-emprestimos.ts` - Ações do sistema

### Componentes
- `/app/components/RegistroEmprestimosGestao.tsx` - Interface de gestão
- `/app/components/PaginacaoInventario.tsx` - Listagem paginada de itens

### Firebase
- Funções adicionadas em `/app/api/firebaseConnection.server.js`:
  - `getItensInventario()`
  - `getEmprestimosInventario()`
  - `getSolicitacoesInventario()`
  - `cadastrarItemInventario()`
  - `solicitarEmprestimoInventario()`
  - `aprovarSolicitacaoInventario()`
  - `rejeitarSolicitacaoInventario()`
  - `registrarDevolucaoInventario()`

### Tipos
- Tipos adicionados em `/app/utils/types.ts`:
  - `ItemInventario`
  - `EmprestimoInventario`
  - `SolicitacaoEmprestimoInventario`

## Fluxo de Uso

### Para AMECICLISTAS
1. Acessa "Registro de Empréstimos" no menu principal
2. Navega pelos itens disponíveis usando busca e filtros
3. Clica em "Solicitar Empréstimo" no item desejado
4. Confirma a solicitação
5. Aguarda aprovação de um PROJECT_COORDINATOR

### Para PROJECT_COORDINATORS
1. Acessa a área de "Gestão" no sistema
2. Visualiza solicitações pendentes
3. Aprova ou rejeita solicitações
4. Registra devoluções quando itens são retornados
5. Cadastra novos itens no inventário

## Categorias do Inventário

Baseado na planilha fornecida, as categorias principais são:

1. **Oficina mecânica** - Ferramentas e equipamentos de manutenção
2. **Caixotes** - Materiais organizados em caixas (captação, festa, ação direta, etc.)
3. **Mobiliário** - Mesas, cadeiras, armários, estantes, etc.
4. **Equipamentos eletrônicos** - Notebooks, câmeras, impressoras, etc.
5. **Equipamentos elétricos** - Ventiladores, micro-ondas, caixas de som, etc.
6. **Equipamentos em geral** - Tripés, caixas organizadoras, paraciclos, etc.

## Script de População

Execute o script para popular o inventário com itens de exemplo:

```bash
node scripts/populate-inventario.js
```

## Integração com Menu Principal

O sistema foi integrado ao menu principal com:
- Ícone: 📦
- Permissão: AMECICLISTAS
- Posição: Após "Bota pra Rodar"

## Considerações de Segurança

- Todas as operações passam pelo Firebase através do arquivo `firebaseConnection.server.js`
- Validação de permissões em todas as ações
- Sanitização de dados de entrada
- Logs de auditoria para ações administrativas

## Melhorias Futuras

- Sistema de notificações para aprovações/rejeições
- Relatórios de uso dos itens
- Sistema de reservas antecipadas
- Integração com calendário para empréstimos com prazo
- Fotos dos itens do inventário
- Código de barras/QR Code para identificação rápida