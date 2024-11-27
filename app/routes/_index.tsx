import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getTelegramUserInfo, getTelegramGeneralDataInfo } from "../api/users";
import { UserCategory, UserData } from "~/api/types";
import { getCategoryByUserId } from "~/api/firebaseConnection.server";
import { useEffect, useState } from "react";

type LoaderData = {
  userCategories: UserCategory[];
  userData: UserData | null;
  telegramData: any;  // Adicionado para armazenar os dados gerais do Telegram
};

export const loader = async () => {
  let userData: UserData | null = null;
  let userCategories: UserCategory[] = [UserCategory.ANY_USER];
  let telegramData: any = {};  // Novo para armazenar os dados gerais do Telegram

  try {
    userData = getTelegramUserInfo();
    
    if (process.env.NODE_ENV === "production" && userData?.id) {
      const DBUserCategory = await getCategoryByUserId(userData?.id);
      userCategories = [DBUserCategory];
    } else {
      if (process.env.NODE_ENV === "development") {
        userCategories = [
          UserCategory.ANY_USER,
          UserCategory.AMECICLISTAS,
          UserCategory.PROJECT_COORDINATORS,
          UserCategory.AMECICLO_COORDINATORS,
        ];
      }
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }

  return json<LoaderData>({ userCategories, userData, telegramData });
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
  const { userCategories, userData } = useLoaderData<LoaderData>();

  const [data, _setData] = useState(userData);
  const [telegramUserData, setTelegramUserData] = useState<any>(null);

  useEffect(() => {
    if (userData) {
      // Após pegar os dados do usuário, faça a busca de dados adicionais do Telegram
      const fetchTelegramData = async () => {
        const telegramInfo = await getTelegramGeneralDataInfo();  // Aqui você pode obter os dados gerais do Telegram, se necessário
        setTelegramUserData(telegramInfo);
      };

      fetchTelegramData();
    }
  }, [userData]);  // Reexecuta o useEffect sempre que o userData mudar

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp {telegramUserData?.id}
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
        {/* Outros links e botões */}
      </div>
    </div>
  );
}
