# Sistema de Testes em Desenvolvimento

Este sistema permite testar diferentes papéis de usuário durante o desenvolvimento sem precisar de dados reais do Telegram.

## Como Usar

### 1. Menu de Desenvolvimento
- Aparece automaticamente no topo da página quando `NODE_ENV=development`
- Permite selecionar entre diferentes usuários fictícios
- Mostra as permissões do usuário atual

### 2. Usuários Fictícios Disponíveis

| Nome | ID | Papéis |
|------|----|---------| 
| João Silva (Usuário Comum) | 999999 | ANY_USER |
| Maria Santos (Ameciclista) | 999998 | AMECICLISTAS |
| Pedro Costa (Coord. Projeto) | 999997 | PROJECT_COORDINATORS |
| Ana Lima (Coord. Ameciclo) | 999996 | AMECICLO_COORDINATORS |
| Dev User (Desenvolvimento) | 999995 | DEVELOPMENT |

### 3. Como Integrar em Novas Páginas

```tsx
import { useDevUser } from "~/utils/useDevUser";
import { createDevTelegramUserWithCategories } from "~/utils/devTelegram";

export default function MinhaPage() {
  const { devUser, isDevMode } = useDevUser();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    if (isDevMode && devUser) {
      // Usar usuário fictício
      const devTelegramUser = createDevTelegramUserWithCategories(devUser);
      setUserPermissions(devTelegramUser.categories);
      setUser({
        id: devUser.id,
        first_name: devUser.name.split(" ")[0],
        last_name: devUser.name.split(" ").slice(1).join(" ")
      });
    } else {
      // Usar Telegram real
      telegramInit();
      setUser(getTelegramUsersInfo());
    }
  }, [devUser, isDevMode]);

  // Verificar permissões usando isDevMode
  const canAccess = isDevMode || isAuth(userPermissions, UserCategory.AMECICLISTAS);
}
```

### 4. Hooks Disponíveis

#### `useDevUser()`
```tsx
const { 
  devUser,           // Usuário fictício atual
  isDevMode,         // true se estiver em desenvolvimento
  getUserId,         // () => number | null
  getUserCategories, // () => UserCategory[]
  hasCategory        // (category: UserCategory) => boolean
} = useDevUser();
```

### 5. Utilitários

#### `createDevTelegramUser(devUser)`
Cria um objeto UserData compatível com o Telegram

#### `createDevTelegramUserWithCategories(devUser)`
Cria um objeto TelegramUser com categorias

#### `mockTelegramWebApp(devUser)`
Simula a API do Telegram WebApp (executado automaticamente)

## Vantagens

- ✅ Testa diferentes níveis de permissão rapidamente
- ✅ Não precisa de dados reais do Telegram
- ✅ Funciona offline
- ✅ Dados consistentes para testes
- ✅ Fácil de alternar entre usuários
- ✅ Não interfere com produção

## Exemplo de Uso

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Abra a aplicação no navegador
3. Use o menu vermelho no topo para selecionar um usuário
4. Teste as funcionalidades com diferentes permissões
5. Observe como a interface muda baseada no papel do usuário