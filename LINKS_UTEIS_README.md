# Sistema de Links Úteis

Sistema dinâmico de gerenciamento de links úteis da Ameciclo com controle de permissões, categorização e analytics.

## 🎯 Funcionalidades

### Para Usuários
- Visualização de links organizados por permissão
- Links com ícones, descrições e cores customizadas
- Tracking automático de cliques
- Filtro por categoria (Público, Ameciclistas, Ameciclobot)
- Links agendados (exibição entre datas específicas)

### Para Coordenadores
- Adicionar novos links
- Editar links existentes
- Deletar links
- Ativar/desativar links
- Definir ordem de exibição
- Configurar agendamento
- Ver estatísticas de cliques

## 📊 Estrutura de Dados

### LinkUtil
```typescript
{
  id: string;
  label: string;              // Título do link
  url: string;                // URL de destino
  icon: string;               // Emoji
  requiredPermission: UserCategory;
  description?: string;       // Descrição curta
  order: number;              // Ordem de exibição
  startDate?: string;         // Data início (ISO)
  endDate?: string;           // Data fim (ISO)
  color?: string;             // Cor hex (padrão: #14b8a6)
  categories: LinkCategory[]; // [PUBLICO, AMECICLISTAS, AMECICLOBOT]
  clicks: number;             // Total de cliques
  active: boolean;            // Link ativo/inativo
  createdAt: string;
  updatedAt: string;
}
```

### Categorias
- **PUBLICO**: Visível para todos
- **AMECICLISTAS**: Visível apenas para membros
- **AMECICLOBOT**: Visível no bot do Telegram

## 🚀 Instalação

### 1. Popular dados iniciais
```bash
node scripts/populate-links-uteis.js
```

### 2. Acessar o sistema
- **Visualização**: `/links-uteis`
- **Gestão**: `/links-uteis/gestao` (apenas coordenadores)

## 🔐 Permissões

### Visualização
- Qualquer usuário pode ver links públicos
- Ameciclistas veem links restritos a membros
- Coordenadores veem todos os links

### Gestão
Apenas usuários com as seguintes permissões podem gerenciar:
- `AMECICLO_COORDINATORS`
- `PROJECT_COORDINATORS`

## 📝 Como Usar

### Adicionar um Link

1. Acesse `/links-uteis/gestao`
2. Clique em "➕ Adicionar Novo Link"
3. Preencha os campos:
   - **Título**: Nome do link
   - **URL**: Endereço completo (com http/https)
   - **Ícone**: Emoji (ex: 🌐)
   - **Descrição**: Texto curto explicativo (opcional)
   - **Permissão**: Quem pode ver o link
   - **Categorias**: Onde o link aparece (marque as caixas)
   - **Ordem**: Posição na lista (1 = primeiro)
   - **Cor**: Cor da borda (padrão: verde)
   - **Agendamento**: Datas de início/fim (opcional)
   - **Ativo**: Se o link está visível
4. Clique em "➕ Criar"

### Editar um Link

1. Na página de gestão, clique no ícone ✏️ do link
2. Modifique os campos desejados
3. Clique em "💾 Salvar"

### Deletar um Link

1. Na página de gestão, clique no ícone 🗑️ do link
2. Confirme a exclusão

## 📈 Analytics

Cada link registra automaticamente:
- **Total de cliques**: Incrementado a cada acesso
- Exibido na página de gestão

## 🎨 Customização

### Cores
Use o seletor de cor para definir a cor da borda do link. Padrão: `#14b8a6` (teal).

### Ícones
Use emojis para representar visualmente o link:
- 🌐 Sites
- 📊 Dados/Analytics
- 📚 Documentação
- 🗂 Arquivos
- 📅 Eventos
- 🏠 Locais

### Agendamento
Links podem ser configurados para aparecer apenas em períodos específicos:
- **Data Início**: Link começa a aparecer
- **Data Fim**: Link para de aparecer
- Útil para eventos temporários ou campanhas

## 🔄 Migração de Dados

Os links hardcoded foram migrados para o Firebase com:
- Categorias padrão: PUBLICO e AMECICLISTAS
- Cor padrão: #14b8a6 (verde teal)
- Ordem sequencial (1-12)
- Todos ativos por padrão

## 📱 Integração

### Telegram Bot
Links marcados com categoria `AMECICLOBOT` podem ser exibidos no bot do Telegram.

### Menu Principal
Link de acesso aparece no menu principal para usuários com permissão.

## 🛠️ Manutenção

### Reordenar Links
Edite o campo "Ordem" de cada link. Links são exibidos em ordem crescente.

### Desativar Temporariamente
Desmarque "Link Ativo" para ocultar sem deletar.

### Backup
Os dados estão no Firebase Firestore na coleção `links_uteis`.

## 📊 Estrutura de Arquivos

```
app/
├── routes/
│   ├── links-uteis.tsx           # Visualização
│   └── links-uteis.gestao.tsx    # Gestão
├── handlers/
│   ├── loaders/
│   │   └── links-uteis.ts        # Carregar dados
│   └── actions/
│       └── links-uteis.ts        # CRUD operations
└── utils/
    └── types.ts                  # Tipos TypeScript

scripts/
└── populate-links-uteis.js       # Script de população
```

## 🐛 Troubleshooting

### Links não aparecem
- Verifique se o link está ativo
- Confirme as categorias selecionadas
- Verifique as datas de agendamento
- Confirme as permissões do usuário

### Erro ao criar link
- URL deve incluir http:// ou https://
- Ordem deve ser um número positivo
- Pelo menos uma categoria deve ser selecionada

### Cliques não incrementam
- Verifique a conexão com Firebase
- Confirme que o link tem um ID válido
