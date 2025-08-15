import { UserData } from "./types";

export const getTelegramUsersInfo = (): UserData | null => {
  try {
    // Verifica se estamos no navegador
    if (typeof window !== 'undefined' && window.Telegram) {
      const telegram = window.Telegram?.WebApp;

      // Verifica se o usuário está disponível
      if (telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
        const user = telegram.initDataUnsafe.user;
        // Valida se o objeto user tem as propriedades necessárias
        if (user && typeof user.id === 'number') {
          return user as UserData;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao acessar dados do Telegram:', error);
  }

  return null;
}


export const getTelegramGeneralDataInfo = (): any => {
  try {
    // Verifica se estamos no navegador
    if (typeof window !== 'undefined') {
      const telegram = (window as any)?.Telegram?.WebApp;

      // Verifica se o dado está disponível
      if (telegram && telegram.initDataUnsafe) {
        return telegram.initDataUnsafe;
      }
    }
  } catch (error) {
    console.error('Erro ao acessar dados gerais do Telegram:', error);
  }

  return null;
}