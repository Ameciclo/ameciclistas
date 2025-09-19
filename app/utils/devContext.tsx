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
  // Sempre permitir modo dev se não estiver no Telegram
  const isInTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp?.platform !== 'unknown';
  
  if (process.env.NODE_ENV === 'production' && isInTelegram) return null;
  
  // Tentar ler do localStorage primeiro
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('devUser');
      if (stored && stored.trim()) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      // Limpar localStorage corrompido
      try {
        localStorage.removeItem('devUser');
      } catch {}
    }
  }
  
  return DEV_USERS[0];
}

export function DevProvider({ children }: { children: ReactNode }) {
  const [devUser, setDevUser] = useState<DevUser | null>(null);
  const [realUser, setRealUser] = useState<UserData | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Inicializar no cliente
  useEffect(() => {
    setIsClient(true);
    setDevUser(getInitialDevUser());
  }, []);

  // Detectar se está no Telegram
  const isInTelegram = isClient && window.Telegram?.WebApp?.platform !== 'unknown';
  const isDevMode = process.env.NODE_ENV === 'development' || (isClient && !isInTelegram);

  // Obter permissões baseadas no contexto atual
  const userPermissions = (isDevMode && devUser) 
    ? devUser.categories 
    : [UserCategory.ANY_USER]; // Será expandido para usuário real

  // Carregar usuário real em produção no Telegram
  useEffect(() => {
    if (isClient && !isDevMode && isInTelegram) {
      const telegramUser = getTelegramUsersInfo();
      setRealUser(telegramUser);
    }
  }, [isClient, isDevMode, isInTelegram]);

  // Salvar usuário dev no localStorage
  const handleSetDevUser = (user: DevUser) => {
    setDevUser(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('devUser', JSON.stringify(user));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
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