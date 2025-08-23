import { createContext, useContext, useState, ReactNode } from "react";
import type { DevUser } from "~/components/DevMenu";
import { DEV_USERS } from "~/components/DevMenu";

interface DevContextType {
  devUser: DevUser | null;
  setDevUser: (user: DevUser) => void;
  isDevMode: boolean;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [devUser, setDevUser] = useState<DevUser | null>(
    process.env.NODE_ENV === 'development' ? DEV_USERS[0] : null
  );

  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <DevContext.Provider value={{ devUser, setDevUser, isDevMode }}>
      {children}
    </DevContext.Provider>
  );
}

export function useDevContext() {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDevContext must be used within a DevProvider');
  }
  return context;
}