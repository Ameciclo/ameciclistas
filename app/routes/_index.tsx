import { useLoaderData } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { ButtonsListWithPermissions } from "~/components/Forms/Buttons";

import { loader } from "~/handlers/loaders/_index";
export { loader };

const links = [
  {
    to: "/criar-evento",
    label: "Criar Evento",
    icon: "📅",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/solicitar-pagamento",
    label: "Solicitar Pagamento",
    icon: "💰",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/gestao-fornecedores",
    label: "Gestão de Fornecedores",
    icon: "📦",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/links-uteis",
    label: "Lista de Links Úteis",
    icon: "🔗",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/grupos-de-trabalho",
    label: "Grupos de Trabalho",
    icon: "👥",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/user",
    label: "Suas informações",
    icon: "⚙️",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/users",
    label: "Gerenciamento de Usuários",
    icon: "🔧",
    requiredPermission: UserCategory.AMECICLO_COORDINATORS,
    hide: true,
  },
];

export default function Index() {
  const [user, setUser] = useState<UserData | null>({} as UserData);

  const { usersInfo, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);

  useEffect(() => {
    telegramInit();
    setUser(() => getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as UserCategory]);
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-center">
          Você está no ambiente de DESENVOLVIMENTO
        </p>
      )}
      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-center">Permissões de {userPermissions}</p>
      )}
      {process.env.NODE_ENV === "production" && (
        <p className="text-xs text-center">Olá, {user?.first_name}!</p>
      )}
      <ButtonsListWithPermissions links={links} userPermissions={userPermissions} />
    </div>
  );
}
