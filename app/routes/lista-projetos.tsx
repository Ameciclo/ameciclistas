import { Link, useLoaderData } from "@remix-run/react";
import { isAuth } from "~/hooks/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { UserCategory, UserData } from "~/api/types";
import { useEffect, useState } from "react";
import { loader } from "../loaders/loader";
import { getTelegramUserInfo } from "~/api/users";
import { projectManagement } from "firebase-admin";
export { loader };

export default function ProjetosEmAndamento() {
  const { userCategoriesObject, currentUserCategories, projectsOnGoing } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData);

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo]);

  const projetos = projectsOnGoing;

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">
        🚧 Projetos em Andamento
      </h2>
      <div className="mt-4 flex flex-col">
        {projetos.map((projeto: any) => (
          <a
            key={projeto.id}
            href={`https://www.ameciclo.org/projeto/${projeto.slug}`}
            className="button-full text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {projeto.name}
          </a>
        ))}
      </div>
      <Link to="/" className="button-secondary-full">
        ⬅️ Voltar
      </Link>
    </div>
  ) : (
    <Unauthorized
      pageName="Lista de Projetos"
      requiredPermission="Ameciclistas"
    />
  );
}
