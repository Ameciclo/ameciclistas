// userRoles.ts

export enum UserCategory {
  ANY_USER = "ANY_USER", // Mudar para "ANY_USER" para refletir o nome
  AMECICLISTAS = "AMECICLISTAS",
  PROJECT_COORDINATORS = "PROJECT_COORDINATORS",
  AMECICLO_COORDINATORS = "AMECICLO_COORDINATORS",
}

interface User {
  id: number; // Telegram user ID
  name: string;
  categories: UserCategory[];
}

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
export const users: User[] = [
  {
    id: 157783985, // Replace with actual Telegram user IDs
    name: "Daniel Valença",
    categories: [UserCategory.AMECICLO_COORDINATORS], // Apenas a categoria mais alta
  },
  {
    id: 179092489,
    name: "Lígia Lima",
    categories: [UserCategory.AMECICLISTAS], // Apenas a categoria mais alta
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
  // Add more users as needed
];
