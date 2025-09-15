import { useLoaderData } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import Unauthorized from "~/components/Unauthorized";
import { isAuth } from "~/utils/isAuthorized";
import { CardList } from "~/components/CardsList";
import { BackButton } from "~/components/Forms/Buttons";

import { loader, LoaderData } from "../handlers/loaders/grupos-de-trabalho";
import FormTitle from "~/components/Forms/FormTitle";
export { loader };

export default function GruposTrabalho() {
  const { currentUserCategories, workgroups } = useLoaderData<LoaderData>();

  // Mapear cores para as categorias
  const categoryColors: Record<string, string> = {
    incidir: "#EF4444", // Vermelho
    cultuar: "#3B82F6", // Azul
    articular: "#10B981", // Verde
  };

  // Transformar grupos de trabalho em formato para o CardList
  const cardItems = workgroups.map((group) => ({
    title: group.name,
    description: group.description,
    imageUrl: group.icon?.url,
    linkUrl: group.telegram_url,
    linkText: "Entrar no Grupo",
    badge: group.directive,
    badgeColor: categoryColors[group.directive.toLowerCase()] || "gray",
  }));

  return isAuth(currentUserCategories, UserCategory.AMECICLISTAS) ? (
    <div className="container mx-auto p-4">
      <FormTitle>👥 Grupos de Trabalho da Ameciclo</FormTitle>
      <CardList items={cardItems} />
      <BackButton />
    </div>
  ) : (
    <Unauthorized
      pageName="Grupos de Trabalho"
      requiredPermission="Ameciclistas"
    />
  );
}
