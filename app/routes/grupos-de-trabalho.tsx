import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { UserCategory, UserData } from "~/utils/types";
import Unauthorized from "~/components/Unauthorized";
import { isAuth } from "~/utils/isAuthorized";
import { getTelegramUserInfo } from "~/utils/users";
import { CardList } from "~/components/CardsList";
import { BackButton } from "~/components/CommonButtons";

import { loader, LoaderData } from "../handlers/loaders/grupos-de-trabalho";
export { loader };

export default function GruposTrabalho() {
  const { userCategoriesObject, currentUserCategories, workgroups } =
    useLoaderData<LoaderData>();
  const [userPermissions, setUserPermissions] = useState<UserCategory[]>(
    currentUserCategories
  );
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  // Obter informações do usuário pelo Telegram
  useEffect(() => {
    setUserInfo(() => getTelegramUserInfo());
  }, []);

  // Atualiza permissões com base no usuário
  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([
        userCategoriesObject[userInfo.id] as unknown as UserCategory,
      ]);
    }
  }, [userInfo, userCategoriesObject]);

  // Mapear cores para as categorias
  const categoryColors: Record<string, string> = {
    incidir: "#EF4444", // Vermelho
    cultuar: "#3B82F6", // Azul
    articular: "#10B981", // Verde
  };

  // Transformar grupos de trabalho em formato para o CardList
  const cardItems = workgroups.map((group) => ({
    title: group.name,
    description: group.description,
    imageUrl: group.icon?.url,
    linkUrl: group.telegram_url,
    linkText: "Entrar no Grupo",
    badge: group.directive,
    badgeColor: categoryColors[group.directive.toLowerCase()] || "gray",
  }));

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">
        👥 Grupos de Trabalho da Ameciclo
      </h2>
      <CardList items={cardItems} />
      <BackButton />
    </div>
  ) : (
    <Unauthorized
      pageName="Grupos de Trabalho"
      requiredPermission="Ameciclistas"
    />
  );
}
