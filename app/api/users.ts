// userRoles.ts
import { TelegramUser, UserCategory, UserData } from "./types";

const categoryHierarchy: Record<UserCategory, UserCategory[]> = {
  [UserCategory.ANY_USER]: [],
  [UserCategory.AMECICLISTAS]: [UserCategory.ANY_USER],
  [UserCategory.PROJECT_COORDINATORS]: [
    UserCategory.ANY_USER,
    UserCategory.AMECICLISTAS,
  ],
  [UserCategory.AMECICLO_COORDINATORS]: [
    UserCategory.ANY_USER,
    UserCategory.AMECICLISTAS,
    UserCategory.PROJECT_COORDINATORS,
  ],
};

// Helper function to get user categories including hierarchy
export const getUserCategories = (userId: number): UserCategory[] => {
  const user = users.find((u) => u.id === userId);
  if (user) {
    // Retorna as categorias do usuário, incluindo as hierárquicas
    return [
      ...new Set([
        ...user.categories,
        ...user.categories.flatMap((cat) => categoryHierarchy[cat]),
      ]),
    ];
  }
  return [UserCategory.ANY_USER];
};

// Define your users and their categories
export const users: TelegramUser[] = [
  {
    id: 157783985, // Replace with actual Telegram user IDs
    name: "Daniel Valença",
    categories: [UserCategory.AMECICLO_COORDINATORS], // Apenas a categoria mais alta
  }, {
    id: 934430631, // Replace with actual Telegram user IDs
    name: "Ned Ludd",
    categories: [UserCategory.AMECICLO_COORDINATORS], // Apenas a categoria mais alta
  },
  {
    id: 179092489,
    name: "Lígia Lima",
    categories: [UserCategory.ANY_USER], // Apenas a categoria mais alta
  },
  {
    id: 1049358865,
    name: "Gustavo Barros",
    categories: [UserCategory.PROJECT_COORDINATORS], // Apenas a categoria mais alta
  },
  {
    id: 156302356,
    name: "Igor Matos",
    categories: [UserCategory.AMECICLISTAS], // Apenas a categoria mais alta
  },
  {
    id: 816212630,
    name: "Italo Chaves",
    categories: [UserCategory.PROJECT_COORDINATORS],
  },
  // Add more users as needed
];

export const getTelegramUserInfo = (): UserData | null => {
  // Verifica se estamos no navegador
  if (typeof window !== 'undefined') {
    const telegram = (window as any).Telegram.WebApp;

    // Verifica se o usuário está disponível
    if (telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
      return telegram.initDataUnsafe.user as UserData;
    }
  }

  return null;
}