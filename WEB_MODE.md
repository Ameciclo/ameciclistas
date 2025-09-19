# Modo Web - Testes fora do Telegram

Este projeto agora suporta testes em navegador web comum, fora do ambiente Telegram.

## 🚀 Como usar

### Desenvolvimento Local
```bash
# Modo desenvolvimento normal (com menu dev sempre visível)
npm run dev

# Modo web otimizado (simula produção web)
npm run dev:web
```

### Funcionalidades em Modo Web

✅ **Funcionam normalmente:**
- Todas as funcionalidades do sistema
- Sistema de permissões via menu de desenvolvimento
- Interface responsiva
- Navegação entre páginas
- Formulários e ações

⚠️ **Limitações:**
- Não há integração real com Telegram
- Dados de usuário são simulados
- Notificações do Telegram não funcionam

## 🔧 Sistema de Usuários de Teste

O sistema automaticamente detecta quando não está rodando no Telegram e ativa o **Menu de Desenvolvimento** que permite:

### Usuários Disponíveis:
1. **João Silva** - Usuário Comum (`ANY_USER`)
2. **Maria Santos** - Ameciclista (`AMECICLISTAS`) 
3. **Pedro Costa** - Coordenador de Projeto (`PROJECT_COORDINATORS`)
4. **Ana Lima** - Coordenadora Ameciclo (`AMECICLO_COORDINATORS`)

### Como trocar de usuário:
1. Clique no menu vermelho no topo da página
2. Selecione o usuário desejado
3. O sistema automaticamente aplicará as permissões correspondentes

## 🎯 Cenários de Teste

### Teste como Usuário Comum
- Acesso à Biblioteca (visualização)
- Acesso ao Bota pra Rodar (visualização)
- Links úteis

### Teste como Ameciclista
- Empréstimos de livros
- Solicitação de bicicletas
- Registro de empréstimos
- Consumo de recursos

### Teste como Coordenador
- Gestão de empréstimos
- Aprovação de solicitações
- Relatórios e estatísticas
- Gestão de usuários (apenas Coord. Ameciclo)

## 🔄 Persistência

O usuário selecionado é salvo automaticamente em:
- `localStorage` do navegador
- Cookie da sessão

Isso significa que ao recarregar a página, o usuário selecionado será mantido.

## 🌐 Acesso Remoto

Para testar em dispositivos móveis ou compartilhar com outros:

```bash
# Inicia servidor acessível na rede local
npm run dev:web
```

O servidor ficará disponível em:
- Local: `http://localhost:5173`
- Rede: `http://[seu-ip]:5173`

## 🔍 Debug

Para verificar se está em modo web:
1. Abra o console do navegador (F12)
2. Procure por: `"Executando em modo web (fora do Telegram)"`
3. O menu de desenvolvimento deve estar visível no topo

## 📱 Simulação Mobile

Para uma experiência mais próxima do Telegram:
1. Abra as ferramentas de desenvolvedor (F12)
2. Ative o modo responsivo/mobile
3. Escolha um dispositivo móvel
4. Teste a interface touch

## ⚡ Dicas

- Use o **modo web** para desenvolvimento rápido
- Teste diferentes permissões facilmente
- Ideal para demonstrações e apresentações
- Perfeito para debug de funcionalidades específicas