import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BackButton, ButtonsListWithPermissions } from "~/components/CommonButtons";
import { UserCategory, UserData } from "~/utils/types";
import { loader } from "./_index";
import { getTelegramUserInfo } from "~/utils/users";

export default function LinksUteis() {
  const { currentUserCategories, userCategoriesObject } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  useEffect(() => {
    setUserInfo(() => getTelegramUserInfo());
  }, []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject?.[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as UserCategory]);
    }
  }, [userInfo, userCategoriesObject]);

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
        userPermissions={userPermissions}
      />

      <br />
      <BackButton />
    </div>
  );
}
