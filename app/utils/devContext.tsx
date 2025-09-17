import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { DevUser } from "~/components/DevMenu";
import { DEV_USERS } from "~/components/DevMenu";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";

interface AuthContextType {
  devUser: DevUser | null;
  setDevUser: (user: DevUser) => void;
  isDevMode: boolean;
  userPermissions: UserCategory[];
  realUser: UserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialDevUser(): DevUser | null {
  if (process.env.NODE_ENV !== 'development') return null;
  
  // Tentar ler do cookie
  if (typeof document !== 'undefined') {
    const cookieMatch = document.cookie.match(/devUser=([^;]+)/);
    if (cookieMatch) {
      try {
        return JSON.parse(decodeURIComponent(cookieMatch[1]));
      } catch (e) {
        // Fallback para primeiro usuário se não conseguir parsear
      }
    }
  }
  
  return DEV_USERS[0];
}

export function DevProvider({ children }: { children: ReactNode }) {
  const [devUser, setDevUser] = useState<DevUser | null>(getInitialDevUser);
  const [realUser, setRealUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserCategory[]>([UserCategory.ANY_USER]);
  const isDevMode = process.env.NODE_ENV === 'development';

  // Carregar usuário real e suas permissões em produção
    useEffect(() => {
    if (!isDevMode) {
      const telegramUser = getTelegramUsersInfo();
      setRealUser(telegramUser);
      
      // Buscar permissões do usuário no Firebase
      if (telegramUser?.id) {
        fetch(`/api/user-permissions?userId=${telegramUser.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.role) {
              setUserPermissions([data.role as UserCategory]);
            }
          })
          .catch(err => {
            console.error('Erro ao buscar permissões:', err);
            setUserPermissions([UserCategory.ANY_USER]);
          });
      }
    } else if (devUser) {
      setUserPermissions(devUser.categories);
    }
  }, [isDevMode, devUser]);

  const handleSetDevUser = (user: DevUser) => {
    setDevUser(user);
    if (isDevMode) {
      setUserPermissions(user.categories);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      devUser, 
      setDevUser: handleSetDevUser, 
      isDevMode, 
      userPermissions,
      realUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDevContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useDevContext must be used within a DevProvider');
  }
  return context;
}

// Alias para compatibilidade
export const useAuthContext = useDevContext;