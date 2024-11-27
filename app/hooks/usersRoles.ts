// userRoles.ts
import { users } from "~/mockup/users";
import { UserCategory } from "../utils/types";

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