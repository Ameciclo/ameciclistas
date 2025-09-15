import { useLoaderData } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { CardList } from "~/components/CardsList";
import { BackButton } from "~/components/Forms/Buttons";
import { requireAuth } from "~/utils/authMiddleware";
import { loader as originalLoader } from "~/handlers/loaders/grupos-de-trabalho";
import FormTitle from "~/components/Forms/FormTitle";

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export default function GruposTrabalho() {
  const { workgroups } = useLoaderData<typeof loader>();

  // Mapear cores para as categorias
  const categoryColors: Record<string, string> = {
    incidir: "#EF4444", // Vermelho
    cultuar: "#3B82F6", // Azul
    articular: "#10B981", // Verde
  };

  // Transformar grupos de trabalho em formato para o CardList
  const cardItems = (workgroups || []).map((group) => ({
    title: group.name || '',
    description: group.description || '',
    imageUrl: group.icon?.url,
    linkUrl: group.telegram_url || '',
    linkText: "Entrar no Grupo",
    badge: group.directive || '',
    badgeColor: categoryColors[group.directive?.toLowerCase()] || "gray",
  }));

  return (
    <div className="container mx-auto p-4">
      <FormTitle>👥 Grupos de Trabalho da Ameciclo</FormTitle>
      <CardList items={cardItems} />
      <BackButton />
    </div>
  );
}
