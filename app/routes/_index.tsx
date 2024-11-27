import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getTelegramUserInfo } from "~/api/users";
import { TelegramUser, UserCategory } from "~/api/types";
import { getCategories } from "~/api/firebaseConnection.server";
import { useEffect, useState } from "react";

type LoaderData = {
  userCategories: UserCategory[];
  userCategoriesObject: Record<string, TelegramUser>; // Tipo mais específico
};

export const loader = async () => {
  let userCategories: UserCategory[] = [UserCategory.ANY_USER];
  let userCategoriesObject: Record<string, TelegramUser> = {};

  try {
    if (process.env.NODE_ENV === "development") {
      // Permitir o acesso a todas as categorias no ambiente de desenvolvimento, para testar cada uma comente ou apague a linha
      userCategories = [
        // UserCategory.ANY_USER,
        // UserCategory.AMECICLISTAS,
        // UserCategory.PROJECT_COORDINATORS,
        UserCategory.AMECICLO_COORDINATORS,
      ];
    } else {
      userCategoriesObject = await getCategories();
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
  return json<LoaderData>({ userCategories, userCategoriesObject });
};


const hasAccessToCategory = (crrUserCategories: UserCategory[], category: UserCategory) => {
  const accessHierarchy = {
    [UserCategory.ANY_USER]: [UserCategory.ANY_USER, UserCategory.AMECICLISTAS, UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.AMECICLISTAS]: [UserCategory.AMECICLISTAS, UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.PROJECT_COORDINATORS]: [UserCategory.PROJECT_COORDINATORS, UserCategory.AMECICLO_COORDINATORS],
    [UserCategory.AMECICLO_COORDINATORS]: [UserCategory.AMECICLO_COORDINATORS],
  };
  return accessHierarchy[category]?.some((allowedCategory) => crrUserCategories.includes(allowedCategory));
};


export default function Index() {
  const { userCategories, userCategoriesObject } = useLoaderData<typeof loader>();
  const [currentUserCategories, setCurrentUserCategories] = useState<UserCategory[]>(userCategories);

  useEffect(() => {
    // Verifica se o WebApp do Telegram está disponível
    if (window.Telegram?.WebApp) {
      // Inicializa o Telegram Web App
      window.Telegram.WebApp.ready();

      // Exemplo: Configurações iniciais opcionais
      console.log("Plataforma:", window.Telegram.WebApp.platform);
      console.log("Dados do usuário:", window.Telegram.WebApp.initDataUnsafe);

      // Atualiza a interface com base no tema do Telegram
      document.body.style.backgroundColor =
        window.Telegram.WebApp.themeParams.bg_color || "#ffffff";
      document.body.style.color =
        window.Telegram.WebApp.themeParams.text_color || "#000000";
    } else {
      console.warn("Telegram WebApp SDK não está disponível.");
    }
    const userInfo = getTelegramUserInfo();

    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setCurrentUserCategories([userCategoriesObject[userInfo.id] as any]);
    } else {
      // Permitir o acesso a todas a categoria ANY_USER no ambiente de produção, para testar 
      if (process.env.NODE_ENV === "production") setCurrentUserCategories([UserCategory.ANY_USER]);
    }
  }, [userCategoriesObject]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      <div className="mt-6">
        <Link to="/criar-evento">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.ANY_USER)}
          >
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            📊 Projetos em Andamento
          </button>
        </Link>
        <Link to="/user">
          <button
            className={`button-full ${!hasAccessToCategory(currentUserCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!hasAccessToCategory(currentUserCategories, UserCategory.ANY_USER)}
          >
            ⚙️ Suas configurações
          </button>
        </Link>
      </div>
    </div>
  );
}
