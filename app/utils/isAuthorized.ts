// src/utils/isAuthorized.ts
import { UserCategory } from "~/utils/types";

export const isAuth = (
  currentUserCategories: string[] | UserCategory[],
  category: UserCategory
) => {
  // Validação de segurança
  if (!Array.isArray(currentUserCategories) || !category) {
    return false;
  }
  
  const accessHierarchy = {
    [UserCategory.ANY_USER]: [
      UserCategory.ANY_USER,
      UserCategory.AMECICLISTAS,
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
    ],
    [UserCategory.AMECICLISTAS]: [
      UserCategory.AMECICLISTAS,
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
    ],
    [UserCategory.PROJECT_COORDINATORS]: [
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
    ],
    [UserCategory.AMECICLO_COORDINATORS]: [
      UserCategory.AMECICLO_COORDINATORS,
    ],
  };
  
  const allowedCategories = accessHierarchy[category];
  if (!allowedCategories) {
    return false;
  }
  
  return allowedCategories.some((allowedCategory) =>
    currentUserCategories.includes(allowedCategory)
  );
};
