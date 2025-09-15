import { useState, useEffect } from "react";
import { UserCategory } from "~/utils/types";
import { mockTelegramWebApp } from "~/utils/devTelegram";

interface DevUser {
  id: number;
  name: string;
  categories: UserCategory[];
}

const DEV_USERS: DevUser[] = [
  {
    id: 999999,
    name: "João Silva (Usuário Comum)",
    categories: [UserCategory.ANY_USER]
  },
  {
    id: 999998,
    name: "Maria Santos (Ameciclista)",
    categories: [UserCategory.AMECICLISTAS]
  },
  {
    id: 999997,
    name: "Pedro Costa (Coord. Projeto)",
    categories: [UserCategory.PROJECT_COORDINATORS]
  },
  {
    id: 999996,
    name: "Ana Lima (Coord. Ameciclo)",
    categories: [UserCategory.AMECICLO_COORDINATORS]
  }
];

interface DevMenuProps {
  currentUser: DevUser | null;
  onUserChange: (user: DevUser) => void;
}

export function DevMenu({ currentUser, onUserChange }: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    mockTelegramWebApp(currentUser);
    // Salvar usuário atual no cookie para o middleware
    if (currentUser && typeof document !== 'undefined') {
      document.cookie = `devUser=${encodeURIComponent(JSON.stringify(currentUser))}; path=/`;
    }
  }, [currentUser]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 z-50 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-sm">🚧 MODO DEV</span>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm flex items-center space-x-2"
            >
              <span>👤 {currentUser?.name || "Selecionar Usuário"}</span>
              <span>{isOpen ? "▲" : "▼"}</span>
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white text-black rounded shadow-lg min-w-64 z-10">
                {DEV_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserChange(user);
                      setIsOpen(false);
                      // Forçar atualização do cookie
                      if (typeof document !== 'undefined') {
                        document.cookie = `devUser=${encodeURIComponent(JSON.stringify(user))}; path=/`;
                      }
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${
                      currentUser?.id === user.id ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    <div>{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.categories.join(", ")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {currentUser && (
          <div className="text-sm">
            <span className="font-semibold">ID:</span> {currentUser.id} | 
            <span className="font-semibold"> Papéis:</span> {currentUser.categories.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

export { DEV_USERS };
export type { DevUser };