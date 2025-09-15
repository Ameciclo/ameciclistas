import { useLoaderData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BackButton, ButtonsListWithPermissions } from "~/components/Forms/Buttons";
import { UserCategory, UserData } from "~/utils/types";
import { loader } from "./_index";
import { getTelegramUsersInfo } from "~/utils/users";
import { ProtectedComponent } from "~/components/ProtectedComponent";
import { useAuth } from "~/utils/useAuth";
export { loader };

export default function LinksUteis() {
  const { userPermissions, isDevMode, devUser } = useAuth();

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
    {
      to: "http://internos.ameciclo.org/",
      label: "Eventos Internos",
      icon: "📅",
      requiredPermission: UserCategory.ANY_USER, // Sem restrição
    },
    {
      to: "http://externos.ameciclo.org/",
      label: "Eventos Externos",
      icon: "🌍",
      requiredPermission: UserCategory.ANY_USER, // Sem restrição
    },
    {
      to: "http://organizacional.ameciclo.org/",
      label: "Organizacional",
      icon: "📋",
      requiredPermission: UserCategory.AMECICLISTAS, // Apenas para membros
    },
    {
      to: "http://divulgacao.ameciclo.org/",
      label: "Divulgação de eventos externos",
      icon: "📢",
      requiredPermission: UserCategory.ANY_USER, // Sem restrição
    },
  ];
  

  return (
    <div className="container mx-auto p-4 flex flex-col">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold text-teal-600 text-center">
        🔗 Links Úteis
      </h2>

      {isDevMode && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            🧪 <strong>Modo Dev:</strong> Testando como {devUser?.name}
          </p>
          <p className="text-xs">Permissões: {userPermissions.join(", ")}</p>
        </div>
      )}

      <ButtonsListWithPermissions
        links={links}
        userPermissions={userPermissions || [UserCategory.ANY_USER]}
      />

      <ProtectedComponent requiredPermission={UserCategory.AMECICLISTAS}>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          <p className="text-sm">
            ✅ <strong>Área para Ameciclistas:</strong> Você tem acesso aos links internos!
          </p>
        </div>
      </ProtectedComponent>

      <div className="mt-8">
        <BackButton />
      </div>
    </div>
  );
}
