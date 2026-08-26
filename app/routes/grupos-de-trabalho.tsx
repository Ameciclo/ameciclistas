import { useLoaderData } from "@remix-run/react";
import { UserCategory, FirebaseWorkgroup } from "~/utils/types";
import { CardList } from "~/components/CardsList";
import { BackButton } from "~/components/Forms/Buttons";
import { requireAuth } from "~/utils/authMiddleware";
import { loader as originalLoader } from "~/handlers/loaders/grupos-de-trabalho";
import FormTitle from "~/components/Forms/FormTitle";

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export default function GruposTrabalho() {
  const { workgroups } = useLoaderData<typeof loader>();

  const cardItems = (workgroups || []).map((group: FirebaseWorkgroup) => ({
    title: group.title || group.name,
    description: group.description || "",
    imageUrl: group.iconUrl
      ? `/api/tg-icon?group=${encodeURIComponent(group.firebaseKey)}`
      : undefined,
    linkUrl: group.inviteLink || "",
    linkText: "Entrar no Grupo",
    badge: group.memberCount ? `${group.memberCount} membros` : "",
    badgeColor: "teal",
  }));

  return (
    <div className="container mx-auto p-4">
      <FormTitle>👥 Grupos de Trabalho da Ameciclo</FormTitle>
      <CardList items={cardItems} />
      <BackButton />
    </div>
  );
}
