import { useLoaderData } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { ButtonsListWithPermissions } from "~/components/Forms/Buttons";

import { loader } from "~/handlers/loaders/_index";
export { loader };

const resourcesLinks = [
  {
    to: "/recursos-independentes/registrar-consumo",
    label: "Registrar Consumo",
    icon: "🛒",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/recursos-independentes/fazer-doacao",
    label: "Fazer Doação",
    icon: "💝",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/recursos-independentes/meus-consumos",
    label: "Meus Consumos",
    icon: "📋",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/recursos-independentes/gerenciar",
    label: "Gerenciar Recursos",
    icon: "⚙️",
    requiredPermission: UserCategory.RESOURCES_COORDINATOR,
  },
  {
    to: "/recursos-independentes/historico",
    label: "Histórico de Vendas",
    icon: "📊",
    requiredPermission: UserCategory.RESOURCES_COORDINATOR,
  },
];

export default function RecursosIndependentesIndex() {
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
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
    <>
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-2">
        Controle de Recursos Independentes
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Gerencie consumos, vendas e doações da Ameciclo
      </p>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Como funciona:</strong> Registre seus consumos, faça o pagamento via PIX e aguarde a confirmação da coordenação.
            </p>
          </div>
        </div>
      </div>

      <ButtonsListWithPermissions 
        links={resourcesLinks} 
        userPermissions={userPermissions} 
      />
    </>
  );
}