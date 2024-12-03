import { Link, useLoaderData } from "@remix-run/react";
import { UserCategory, UserData } from "~/api/types";
import { useEffect, useState } from "react";
import { loader } from "~/loaders/solicitar-pagamento-loader";
import { isAuth } from "~/hooks/isAuthorized";
import { getTelegramUserInfo } from "~/api/users";
import telegramInit from "~/hooks/telegramInit";
export { loader }

export default function Index() {
  const { userCategoriesObject, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData)

  useEffect(() => {
    telegramInit();
    setUserInfo(() => getTelegramUserInfo());
  }, []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      {process.env.NODE_ENV === "development" && <p className="text-xs text-center">Você está no ambiente de DESENVOLVIMENTO</p>}
      {process.env.NODE_ENV === "development" && <p className="text-xs text-center">Permissões de {userPermissions}</p>}
      <div className="mt-6">
        <Link to="/criar-evento">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.AMECICLISTAS)}
          >
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)}
          >
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)}
          >
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.ANY_USER)}
          >
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.AMECICLISTAS)}
          >
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.AMECICLISTAS)}
          >
            📊 Projetos em Andamento
          </button>
        </Link>
        <Link to="/user">
          <button
            className={`button-full ${!isAuth(userPermissions, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!isAuth(userPermissions, UserCategory.ANY_USER)}
          >
            ⚙️ Suas configurações
          </button>
        </Link>
      </div>
    </div>
  );
}
