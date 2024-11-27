import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getTelegramUserInfo } from "~/api/users";
import { UserCategory, UserData } from "~/api/types";
import { getCategoryByUserId } from "~/api/firebaseConnection.server";
import { useEffect, useState } from "react";

type LoaderData = {
  userCategories: UserCategory[];
};

export const loader = async () => {
  let userCategories: UserCategory[] = [UserCategory.ANY_USER];

  try {
    if (process.env.NODE_ENV === "development") {
      // Permitir o acesso a todas as categorias no ambiente de desenvolvimento, para testar cada uma comente ou apague a linha
      userCategories = [
        UserCategory.ANY_USER,
        UserCategory.AMECICLISTAS,
        UserCategory.PROJECT_COORDINATORS,
        UserCategory.AMECICLO_COORDINATORS,
      ];
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }

  return json<LoaderData>({ userCategories });
};

const hasAccessToCategory = (userCategories: UserCategory[], category: UserCategory) => {
  const accessHierarchy = {
    [UserCategory.ANY_USER]: [UserCategory.ANY_USER, UserCategory.AMECICLISTAS, UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.AMECICLISTAS]: [UserCategory.AMECICLISTAS, UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.PROJECT_COORDINATORS]: [UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.AMECICLO_COORDINATORS]: [UserCategory.AMECICLO_COORDINATORS],
  };
  return accessHierarchy[category]?.some((allowedCategory) => userCategories.includes(allowedCategory));
};

export default function Index() {
  const { userCategories } = useLoaderData<LoaderData>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [telegramData, setTelegramData] = useState([]);
  console.log(userCategories)

  useEffect(() => {
    setUserData(() => getTelegramUserInfo());
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp {userData?.id}
      </h1>
      <div className="mt-6">
        <Link to="/criar-evento">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS)}
          >
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.ANY_USER)}
          >
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS)}
          >
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.AMECICLISTAS)}
          >
            📊 Projetos em Andamento
          </button>
        </Link>
        <Link to="/user">
          <button
            className={`button-full ${!hasAccessToCategory(userCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(userCategories, UserCategory.ANY_USER)}
          >
            ⚙️ Suas configurações
          </button>
        </Link>
      </div>
    </div>
  );
}
