import { useLoaderData } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { ButtonsListWithPermissions } from "~/components/Forms/Buttons";
import { useDevUser } from "~/utils/useDevUser";
import { createDevTelegramUserWithCategories } from "~/utils/devTelegram";

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
    to: "/biblioteca",
    label: "Biblioteca",
    icon: "📚",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/bota-pra-rodar",
    label: "Bota pra Rodar",
    icon: "🚴",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/registro-emprestimos",
    label: "Registro de Empréstimos",
    icon: "📦",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/recursos-independentes",
    label: "Controle de Recursos Independentes",
    icon: "🏪",
    requiredPermission: UserCategory.AMECICLISTAS,
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
  const { devUser, isDevMode } = useDevUser();

  const { usersInfo, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);

  useEffect(() => {
    if (isDevMode && devUser) {
      const devTelegramUser = createDevTelegramUserWithCategories(devUser);
      setUserPermissions(devTelegramUser.categories);
      setUser({
        id: devUser.id,
        first_name: devUser.name.split(" ")[0],
        last_name: devUser.name.split(" ").slice(1).join(" ")
      });
    } else {
      telegramInit();
      setUser(() => getTelegramUsersInfo());
    }
  }, [devUser, isDevMode]);

  useEffect(() => {
    if (!isDevMode && user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as UserCategory]);
    }
  }, [user, isDevMode]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      {isDevMode ? (
        <div className="text-center mb-4">
          <p className="text-sm text-blue-600 font-semibold">
            🧪 Testando como: {devUser?.name}
          </p>
          <p className="text-xs text-gray-600">
            Permissões: {userPermissions.join(", ")}
          </p>
        </div>
      ) : (
        <p className="text-sm text-center mb-4">Olá, {user?.first_name}!</p>
      )}
      <ButtonsListWithPermissions links={links} userPermissions={userPermissions} />
    </div>
  );
}
