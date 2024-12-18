import { useEffect, useState } from "react";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUserInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

// Custom Hook para pegar as permissões do usuário
export const useUserPermission = (userCategoriesObject: any) => {
  const [userPermissions, setUserPermissions] = useState<UserCategory[]>([]);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  // Inicializa o Telegram e obtém as informações do usuário
  useEffect(() => {
    telegramInit();
    setUserInfo(getTelegramUserInfo());
  }, []);

  // Atualiza as permissões do usuário
  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as UserCategory]);
    }
  }, [userInfo, userCategoriesObject]);

  return { userPermissions, userInfo };
};
