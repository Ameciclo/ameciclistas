import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BackButton, ButtonsListWithPermissions } from "~/components/CommonButtons";
import { UserCategory, UserData } from "~/utils/types";
import { loader } from "./_index";
import { getTelegramUsersInfo } from "~/utils/users";
export { loader };

export default function LinksUteis() {
  const { currentUserCategories, usersInfo } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo?.[user.id]) {
      setUserPermissions([usersInfo[user.id].role as UserCategory]);
    }
  }, [user, usersInfo]);

  const links = [
    {
      to: "https://ameciclo.org",
      label: "Site da Ameciclo",
      icon: "🌐",
      requiredPermission: UserCategory.ANY_USER, // Sem restrição
    },
    {
      to: "http://dados.ameciclo.org/",
      label: "Plataforma de Dados",
      icon: "📈",
      requiredPermission: UserCategory.ANY_USER, // Apenas para membros
    },
    {
      to: "http://biciclopedia.ameciclo.org/",
      label: "Biciclopedia",
      icon: "📚",
      requiredPermission: UserCategory.ANY_USER, // Apenas para membros
    },
    {
      to: "http://drive.ameciclo.org/",
      label: "Drive da Ameciclo",
      icon: "🗂",
      requiredPermission: UserCategory.AMECICLISTAS, // Coordenadores de projeto
    },
    {
      to: "http://pautas.ameciclo.org/",
      label: "Ver pautas para R.O",
      icon: "📄",
      requiredPermission: UserCategory.AMECICLISTAS, // Apenas para membros
    },
    {
      to: "http://transparencia.ameciclo.org/",
      label: "Acompanhar nossos gastos",
      icon: "📈",
      requiredPermission: UserCategory.AMECICLISTAS, // Apenas para membros
    },
    {
      to: "http://ocupe.ameciclo.org/",
      label: "Ocupar a sede",
      icon: "🏠",
      requiredPermission: UserCategory.AMECICLISTAS, // Apenas para membros
    },
    {
      to: "http://equipamento.ameciclo.org/",
      label: "Requisitar equipamento",
      icon: "🎥",
      requiredPermission: UserCategory.AMECICLISTAS, // Coordenadores de projeto
    },
  ];

  return (
    <div className="container mx-auto p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-teal-600 text-center">
        🔗 Links Úteis
      </h2>

      <ButtonsListWithPermissions
        links={links}
        userPermissions={userPermissions || [UserCategory.ANY_USER]}
      />

      <br />
      <BackButton />
    </div>
  );
}
