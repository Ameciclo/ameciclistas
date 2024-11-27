import { UserData } from "~/utils/types";

export const getTelegramUserInfo = (): UserData | null => {
  // Verifica se estamos no navegador
  if (typeof window !== "undefined") {
    const telegram = (window as any).Telegram.WebApp;

    // Verifica se o usuário está disponível
    if (telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
      return telegram.initDataUnsafe.user as UserData;
    }
  }

  return null;
};

export const getTelegramGeneralDataInfo = (): any => {
  // Verifica se estamos no navegador
  if (typeof window !== "undefined") {
    const telegram = (window as any)?.Telegram.WebApp;

    // Verifica se o dado está disponível
    if (telegram && telegram.initDataUnsafe) {
      return telegram.initDataUnsafe as UserData;
    }
  }

  return null;
};
