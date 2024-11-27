// userRoles.ts
import { users } from "~/mockup/users";
import { UserCategory, UserData } from "./types";

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


export const getTelegramGeneralDataInfo = (): any => {
  // Verifica se estamos no navegador
  if (typeof window !== 'undefined') {
    const telegram = (window as any)?.Telegram.WebApp;

    // Verifica se o dado está disponível
    if (telegram && telegram.initDataUnsafe) {
      return telegram.initDataUnsafe as UserData;
    }
  }

  return null;
}