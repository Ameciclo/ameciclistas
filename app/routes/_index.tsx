import { Link, useLoaderData } from "@remix-run/react";
import { UserCategory } from "~/api/types";
import { useEffect } from "react";
import { loader } from "~/loaders/solicitar-pagamento-loader";
import { isAuth } from "~/hooks/isAuthorized";
export { loader }

export default function Index() {
  const { currentUserCategories, userInfo, userCategoriesObject } = useLoaderData<typeof loader>();

  useEffect(() => {
    // Verifica se o WebApp do Telegram está disponível
    if (window.Telegram?.WebApp) {
      // Inicializa o Telegram Web App
      window.Telegram.WebApp.ready();

      // Exemplo: Configurações iniciais opcionais
      console.log("Plataforma:", window.Telegram.WebApp.platform);
      console.log("Dados do usuário:", window.Telegram.WebApp.initDataUnsafe);
    } else {
      console.warn("Telegram WebApp SDK não está disponível.");
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      <span>{JSON.stringify(userInfo)}</span>
      <span>{JSON.stringify(userCategoriesObject)}</span>
      <div className="mt-6">
        <Link to="/criar-evento">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.PROJECT_COORDINATORS)}
          >
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.ANY_USER)}
          >
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.AMECICLISTAS) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.AMECICLISTAS)}
          >
            📊 Projetos em Andamento
          </button>
        </Link>
        <Link to="/user">
          <button
            className={`button-full ${!isAuth(currentUserCategories, UserCategory.ANY_USER) ? "button-disabled" : ""}`}
            disabled={!isAuth(currentUserCategories, UserCategory.ANY_USER)}
          >
            ⚙️ Suas configurações
          </button>
        </Link>
      </div>
    </div>
  );
}
