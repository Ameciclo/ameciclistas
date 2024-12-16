import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GrupoTrabalho, UserCategory, UserData } from "~/utils/types";
import Unauthorized from "~/components/Unauthorized";
import { isAuth } from "~/hooks/isAuthorized";
import { loader } from "../loaders/solicitar-pagamento-loader";
import { getTelegramUserInfo } from "~/utils/users";
export { loader }

export default function GruposTrabalho() {
  const { userCategoriesObject, currentUserCategories, workgroups } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData);
  const [grupos, setGrupos] = useState<GrupoTrabalho[] | null>([]);

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  useEffect(() => {
    setGrupos(
      workgroups.map((group) => ({
        id: group.id,
        nome: group.name,
        coordenacao: group.projects.map((project) => project.name).join(", "),
        descricao: group.description,
        imagem: group.icon.formats.thumbnail.url,
        link: group.telegram_url,
        categoria: group.directive,
      }))
    );
  }, []);

  const categorias = Array.from(new Set(grupos?.map(grupo => grupo.categoria)));

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">👥 Grupos de Trabalho da Ameciclo</h2>

      {categorias.map(categoria => (
        <div key={categoria} className="mt-6">
          <h3 className="text-xl font-bold text-teal-500">{categoria}</h3>
          {grupos?.filter(grupo => grupo.categoria === categoria).map(grupo => (
            <div key={grupo.id} className="border p-4 rounded-lg mb-4">
              <img src={grupo.imagem} alt={`${grupo.nome} - Capa`} className="w-full h-40 object-cover rounded" />
              <h4 className="text-lg font-bold">{grupo.nome}</h4>
              <p className="mt-2">{grupo.descricao}</p>
              <br />
              <Link to={grupo.link} target="_blank" className="button-full mt-2">Entrar no Grupo</Link>
            </div>
          ))}
        </div>
      ))}

      <Link to="/" className="button-secondary-full">
        ⬅️ Voltar
      </Link>
    </div>
  ) : <Unauthorized pageName="Grupos de Trabalho" requiredPermission="Ameciclistas" />
}
