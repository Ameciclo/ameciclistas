import { useLoaderData, Link, useOutletContext } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { ButtonsListWithPermissions } from "~/components/Forms/Buttons";
import { requireAuth } from "~/utils/authMiddleware";

import { loader as originalLoader } from "~/handlers/loaders/_index";

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

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
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/recursos-independentes/estoque",
    label: "Gerenciar Estoque",
    icon: "📦",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/recursos-independentes/historico",
    label: "Histórico de Vendas",
    icon: "📊",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
];

export default function RecursosIndependentesIndex() {
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
  const { userPermissions, isDevMode, devUser } = useOutletContext<any>();

  useEffect(() => {
    if (isDevMode && devUser) {
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

  return (
    <>
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>
      
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

      {isDevMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            🧪 <strong>Debug:</strong> Usuário: {devUser?.name}
          </p>
          <p className="text-xs">Permissões: {JSON.stringify(userPermissions)}</p>
        </div>
      )}

      <ButtonsListWithPermissions 
        links={resourcesLinks} 
        userPermissions={userPermissions || [UserCategory.AMECICLISTAS]} 
      />
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu Principal
        </Link>
      </div>
    </>
  );
}