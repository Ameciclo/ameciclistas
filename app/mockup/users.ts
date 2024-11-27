import { TelegramUser, UserCategory } from "~/api/types";

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
  