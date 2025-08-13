# Sistema de Controle de Recursos Independentes

Este sistema foi desenvolvido para facilitar o registro e controle de vendas e doações da Ameciclo, substituindo o processo manual atual.

## 🎯 Objetivo

Facilitar o registro de consumos e pagamentos de produtos da Ameciclo, permitindo que os próprios usuários registrem seus consumos e façam os pagamentos via PIX, com confirmação posterior da coordenação.

## 📋 Funcionalidades

### Para Usuários (AMECICLISTAS)
- **Registrar Consumo**: Selecionar produtos, variações e quantidades
- **Fazer Doação**: Registrar doações com valores personalizados
- **Meus Consumos**: Visualizar histórico pessoal e marcar pagamentos
- **Pagamento via PIX**: Instruções automáticas para pagamento

### Para Coordenadores (RESOURCES_COORDINATOR)
- **Gerenciar Recursos**: Confirmar ou rejeitar vendas e doações pagas
- **Histórico de Vendas**: Relatórios com estatísticas e análises
- **Controle de Estoque**: Visualização de produtos e variações

## 🏪 Categorias de Produtos

### 🍺 Líquidos (Cervejas)
- Cerveja Lata (R$ 6,00)
- Cerveja Long Neck (R$ 6,00)
- Preços promocionais configuráveis

### 👕 Camisas
- Variações por tamanho (P, M, G)
- Variações por cor (Branca, Preta)
- Controle de estoque por variação

### 📌 Broches
- Diversos modelos (Bicicleta, Capacete, etc.)
- Preço padrão R$ 5,00

### 🔧 Peças de Bicicleta
- Câmaras de ar
- Kits de reparo
- Outras peças avulsas

### 📚 Livros
- Manual do Ciclista Urbano
- Kits educativos
- Materiais sobre mobilidade

### ⚙️ Serviços
- Aluguel de paraciclos
- Manutenção de bicicletas
- Equipamentos eletrônicos

## 🔄 Fluxo de Processo

### Vendas
1. **Registro**: Usuário seleciona produto e quantidade
2. **Pagamento**: Sistema gera instruções PIX (ameciclo@gmail.com)
3. **Confirmação**: Usuário marca como pago e anexa comprovante
4. **Validação**: Coordenador confirma ou rejeita o pagamento
5. **Finalização**: Venda confirmada e registrada no histórico

### Doações
1. **Registro**: Usuário define valor e mensagem opcional
2. **Pagamento**: Mesmo fluxo das vendas
3. **Confirmação**: Coordenador valida a doação

## 🗂️ Estrutura no Firebase

```
resources/
├── products/
│   ├── produto-id/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── category: ProductCategory
│   │   ├── price: number
│   │   ├── stock: number
│   │   ├── description?: string
│   │   └── variants?: ProductVariant[]
├── sales/
│   ├── venda-id/
│   │   ├── id: string
│   │   ├── userId: number
│   │   ├── userName: string
│   │   ├── productId: string
│   │   ├── productName: string
│   │   ├── quantity: number
│   │   ├── totalValue: number
│   │   ├── status: SaleStatus
│   │   ├── createdAt: string
│   │   ├── paidAt?: string
│   │   ├── confirmedAt?: string
│   │   └── paymentProof?: string
└── donations/
    ├── doacao-id/
    │   ├── id: string
    │   ├── userId: number
    │   ├── userName: string
    │   ├── value: number
    │   ├── description?: string
    │   ├── status: SaleStatus
    │   ├── createdAt: string
    │   ├── paidAt?: string
    │   ├── confirmedAt?: string
    │   └── paymentProof?: string
```

## 🚀 Como Usar

### Configuração Inicial
1. Execute o script de população de produtos:
```bash
node scripts/populate-products.js
```

2. Configure as permissões de usuário no Firebase:
```javascript
// Adicionar coordenador de recursos
subscribers/
  userId: {
    role: "RESOURCES_COORDINATOR"
  }
```

### Acesso ao Sistema
1. Acesse o menu principal do bot
2. Clique em "Controle de Recursos Independentes"
3. Escolha a ação desejada

### Para Usuários
1. **Registrar Consumo**:
   - Selecione categoria e produto
   - Escolha variação (se aplicável)
   - Defina quantidade
   - Confirme o registro

2. **Fazer Pagamento**:
   - Acesse "Meus Consumos"
   - Clique em "Marcar como Pago"
   - Faça o PIX para ameciclo@gmail.com
   - Cole o comprovante (opcional)

### Para Coordenadores
1. **Confirmar Pagamentos**:
   - Acesse "Gerenciar Recursos"
   - Revise vendas e doações pendentes
   - Confirme ou rejeite pagamentos

2. **Visualizar Relatórios**:
   - Acesse "Histórico de Vendas"
   - Filtre por período
   - Analise estatísticas

## 🔧 Manutenção

### Adicionar Novos Produtos
Edite o arquivo `scripts/populate-products.js` e execute novamente, ou adicione diretamente no Firebase.

### Gerenciar Estoque
O controle de estoque é manual através do Firebase. Para produtos com variações, o estoque é controlado por variação.

### Relatórios
O sistema gera automaticamente:
- Receita total por período
- Vendas por categoria
- Top 5 produtos mais vendidos
- Histórico detalhado de transações

## 🎨 Interface

O sistema utiliza:
- **Tailwind CSS** para estilização
- **Tabs** para organização de conteúdo
- **Cards** para exibição de produtos e transações
- **Formulários responsivos** para entrada de dados
- **Status coloridos** para identificação rápida

## 🔒 Permissões

- **ANY_USER**: Acesso básico ao sistema
- **AMECICLISTAS**: Pode registrar consumos e doações
- **RESOURCES_COORDINATOR**: Pode gerenciar e confirmar transações
- **AMECICLO_COORDINATORS**: Acesso total ao sistema

## 📱 Integração Telegram

O sistema está integrado ao bot do Telegram da Ameciclo, permitindo:
- Autenticação automática via Telegram
- Notificações de pagamentos (futuro)
- Interface web responsiva dentro do Telegram