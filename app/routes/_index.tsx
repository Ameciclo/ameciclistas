import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getUserCategories, UserCategory } from "../api/users";

export default function Index() {
  const [userCategories, setUserCategories] = useState<UserCategory[]>([
    UserCategory.ANY_USER,
  ]);

  useEffect(() => {
    const telegram = (window as any)?.Telegram?.WebApp;
    let userId;

    if (process.env.NODE_ENV === "development") {
      // Carregar o ID do usuário a partir do arquivo JSON
      fetch("/devUserId.json")
        .then((response) => response.json())
        .then((data) => {
          userId = data.userId;
          setUserCategories(getUserCategories(userId));
        })
        .catch((error) =>
          console.error("Erro ao carregar o ID do usuário:", error)
        );
    } else {
      userId = telegram?.initDataUnsafe?.user?.id;
      if (userId) {
        setUserCategories(getUserCategories(userId));
      }
    }
  }, []);

  const isAccessible = (requiredCategory: UserCategory) =>
    userCategories.includes(requiredCategory);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      <div className="mt-6">
        <Link to="/criar-evento">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.AMECICLISTAS) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.AMECICLISTAS)}
          >
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.PROJECT_COORDINATORS)}
          >
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.PROJECT_COORDINATORS) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.PROJECT_COORDINATORS)}
          >
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.ANY_USER) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.ANY_USER)}
          >
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.AMECICLISTAS) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.AMECICLISTAS)}
          >
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.AMECICLISTAS) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.AMECICLISTAS)}
          >
            📊 Projetos em Andamento
          </button>
        </Link>
        <Link to="/user">
          <button
            className={`button-full ${
              !isAccessible(UserCategory.ANY_USER) ? "button-disabled" : ""
            }`}
            disabled={!isAccessible(UserCategory.ANY_USER)}
          >
            ⚙️ Suas configurações
          </button>
        </Link>
      </div>
    </div>
  );
}
