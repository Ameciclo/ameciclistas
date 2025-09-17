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

  const isDevMode = process.env.NODE_ENV === 'development';

  // Obter permissões baseadas no contexto atual
  const userPermissions = isDevMode && devUser 
    ? devUser.categories 
    : [UserCategory.ANY_USER]; // Será expandido para usuário real

  // Carregar usuário real em produção
  useEffect(() => {
    if (!isDevMode) {
      const telegramUser = getTelegramUsersInfo();
      setRealUser(telegramUser);
    }
  }, [isDevMode]);

  return (
    <AuthContext.Provider value={{ 
      devUser, 
      setDevUser, 
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