import { Link, useLoaderData } from "@remix-run/react";
import { isAuth } from "~/hooks/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { UserCategory, UserData } from "~/api/types";
import { useEffect, useState } from "react";
import { loader } from "../loaders/loader";
import { getTelegramUserInfo } from "~/api/users";
export { loader }

export default function ProjetosEmAndamento() {
  const { userCategoriesObject, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData)

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  const projetos = [
    { id: 1, nome: "Projeto Ciclovias Recife" },
    { id: 2, nome: "Projeto Educação para o Trânsito" },
    { id: 3, nome: "Projeto de Integração de Modais" },
  ];

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">🚧 Projetos em Andamento</h2>
      <div className="mt-4">
        {projetos.map((projeto) => (
          <button key={projeto.id} className="button-full">
            {projeto.nome}
          </button>
        ))}
      </div>
      <Link to="/" className="button-secondary-full">
        ⬅️ Voltar
      </Link>
    </div>
  ) : <Unauthorized pageName="Lista de Projetos" requiredPermission="Ameciclistas" />
}
