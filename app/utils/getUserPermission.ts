import { useEffect, useState } from "react";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

// Custom Hook para pegar as permissões do usuário
export const useUserPermission = (userCategoriesObject: any) => {
  const [userPermissions, setUserPermissions] = useState<UserCategory[]>([]);
  const [usersInfo, setusersInfo] = useState<UserData | null>(null);

  // Inicializa o Telegram e obtém as informações do usuário
  useEffect(() => {
    telegramInit();
    setusersInfo(getTelegramUsersInfo());
  }, []);

  // Atualiza as permissões do usuário
  useEffect(() => {
    if (usersInfo?.id && userCategoriesObject[usersInfo.id]) {
      setUserPermissions([userCategoriesObject[usersInfo.id] as UserCategory]);
    }
  }, [usersInfo, userCategoriesObject]);

  return { userPermissions, usersInfo };
};
