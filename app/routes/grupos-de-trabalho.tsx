import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { UserCategory, UserData } from "~/api/types";
import Unauthorized from "~/components/Unauthorized";
import { isAuth } from "~/hooks/isAuthorized";
import { getTelegramUserInfo } from "~/api/users";
import { loader } from "../loaders/solicitar-pagamento-loader";
export { loader }

interface GrupoTrabalho {
  id: number;
  nome: string;
  coordenacao: string;
  descricao: string;
  imagem: string;
  link: string;
  categoria: string;
}

const grupos: GrupoTrabalho[] = [
  {
    id: 1,
    nome: "Grupo de Mobilidade Ativa",
    coordenacao: "Maria da Silva",
    descricao: "Promover ações para incentivar o uso de bicicletas e a mobilidade ativa.",
    imagem: "https://via.placeholder.com/150", // URL da imagem de capa
    link: "https://t.me/ameciclo_mobilidadeativa",
    categoria: "Cultura da Bicicleta",
  },
  {
    id: 2,
    nome: "Grupo de Comunicação",
    coordenacao: "João Pereira",
    descricao: "Comunicar as ações da Ameciclo e engajar a comunidade.",
    imagem: "https://via.placeholder.com/150", // URL da imagem de capa
    link: "https://t.me/ameciclo_comunicacao",
    categoria: "Articulação Institucional",
  },
  {
    id: 3,
    nome: "Grupo de Educação",
    coordenacao: "Ana Costa",
    descricao: "Educação para o trânsito e formação de novos ciclistas.",
    imagem: "https://via.placeholder.com/150", // URL da imagem de capa
    link: "https://t.me/ameciclo_educacao",
    categoria: "Incidência Política",
  },
];

export default function GruposTrabalho() {
  const { userCategoriesObject, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData)

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  const categorias = Array.from(new Set(grupos.map(grupo => grupo.categoria)));

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">👥 Grupos de Trabalho da Ameciclo</h2>

      {categorias.map(categoria => (
        <div key={categoria} className="mt-6">
          <h3 className="text-xl font-bold text-teal-500">{categoria}</h3>
          {grupos.filter(grupo => grupo.categoria === categoria).map(grupo => (
            <div key={grupo.id} className="border p-4 rounded-lg mb-4">
              <img src={grupo.imagem} alt={`${grupo.nome} - Capa`} className="w-full h-40 object-cover rounded" />
              <h4 className="text-lg font-bold">{grupo.nome}</h4>
              <p className="text-sm font-semibold">Coordenação: {grupo.coordenacao}</p>
              <p className="mt-2">{grupo.descricao}</p>
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
