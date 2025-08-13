// src/utils/isAuthorized.ts
import { UserCategory } from "~/utils/types";

export const isAuth = (
  currentUserCategories: string[],
  category: UserCategory
) => {
  const accessHierarchy = {
    [UserCategory.ANY_USER]: [
      UserCategory.ANY_USER,
      UserCategory.AMECICLISTAS,
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
      UserCategory.DEVELOPMENT,
    ],
    [UserCategory.AMECICLISTAS]: [
      UserCategory.AMECICLISTAS,
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
      UserCategory.DEVELOPMENT,
    ],
    [UserCategory.PROJECT_COORDINATORS]: [
      UserCategory.PROJECT_COORDINATORS,
      UserCategory.AMECICLO_COORDINATORS,
      UserCategory.DEVELOPMENT,
    ],
    [UserCategory.AMECICLO_COORDINATORS]: [
      UserCategory.AMECICLO_COORDINATORS,
      UserCategory.DEVELOPMENT,
    ],
    [UserCategory.DEVELOPMENT]: [UserCategory.DEVELOPMENT],
  };
  return accessHierarchy[category]?.some((allowedCategory) =>
    currentUserCategories?.includes(allowedCategory)
  ) || true;
};
