import { useLoaderData, Link, useOutletContext } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { ButtonsListWithPermissions } from "~/components/Forms/Buttons";
import { useAuth } from "~/utils/useAuth";
import { createDevTelegramUserWithCategories } from "~/utils/devTelegram";
import { isAuth } from "~/utils/isAuthorized";
import { isTelegram } from "~/utils/isTelegram";
import { WebUserInfo } from "~/components/WebUserInfo";
import type { WebUser } from "~/api/webAuth.server";

import { loader } from "~/handlers/loaders/_index";
export { loader };

const links = [
  {
    to: "/criar-evento",
    label: "Criar Evento",
    icon: "📅",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/solicitar-pagamento",
    label: "Solicitar Pagamento",
    icon: "💰",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/gestao-fornecedores",
    label: "Gestão de Fornecedores",
    icon: "📦",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/biblioteca",
    label: "Biblioteca",
    icon: "📚",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/bota-pra-rodar",
    label: "Bota pra Rodar",
    icon: "🚴",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/registro-emprestimos",
    label: "Registro de Empréstimos",
    icon: "📦",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/recursos-independentes/registrar-consumo",
    label: "Registrar Consumo",
    icon: "🛒",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/links-uteis",
    label: "Lista de Links Úteis",
    icon: "🔗",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/grupos-de-trabalho",
    label: "Grupos de Trabalho",
    icon: "👥",
    requiredPermission: UserCategory.AMECICLISTAS,
  },
  {
    to: "/user",
    label: "Suas informações",
    icon: "⚙️",
    requiredPermission: UserCategory.ANY_USER,
  },
  {
    to: "/newsletter",
    label: "Newsletter",
    icon: "📧",
    requiredPermission: UserCategory.PROJECT_COORDINATORS,
  },
  {
    to: "/users",
    label: "Gerenciamento de Usuários",
    icon: "🔧",
    requiredPermission: UserCategory.AMECICLO_COORDINATORS,
  },
];

export default function Index() {
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const { devUser, isDevMode, userPermissions } = useAuth();
  const [isInTelegram, setIsInTelegram] = useState(false);
  const { webUser } = useOutletContext<{ webUser?: WebUser }>();

  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();

  useEffect(() => {
    setIsInTelegram(isTelegram());
    
    if (isDevMode && devUser) {
      setUser({
        id: devUser.id,
        first_name: devUser.name.split(" ")[0],
        last_name: devUser.name.split(" ").slice(1).join(" ")
      });
    } else {
      telegramInit();
      setUser(() => getTelegramUsersInfo());
    }
  }, [devUser, isDevMode]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Ameciclobot Miniapp
      </h1>
      
      {/* Mostrar informações do usuário web se logado */}
      {webUser && <WebUserInfo webUser={webUser} />}
      
      {isDevMode ? (
        <div className="text-center mb-4">
          <p className="text-sm text-blue-600 font-semibold">
            🧪 Testando como: {devUser?.name}
          </p>
          <p className="text-xs text-gray-600">
            Permissões: {userPermissions.join(", ")}
          </p>
        </div>
      ) : !webUser ? (
        <p className="text-sm text-center mb-4">Olá, {user?.first_name}!</p>
      ) : null}
      
      {/* Botão de login se não estiver logado via web */}
      {!webUser && !isInTelegram && (
        <div className="text-center mb-4">
          <Link 
            to="/login" 
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium inline-block no-underline"
          >
            🔑 Fazer Login Web
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            Necessário para acessar Newsletter e outras funções
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {links.filter(link => !link.hide).map((link) => {
          const hasPermission = isAuth(userPermissions, link.requiredPermission);
          if (!hasPermission) return null;
          
          // Newsletter só funciona fora do Telegram
          if (link.to === '/newsletter' && isInTelegram) return null;
          
          const hasGestao = ['biblioteca', 'bota-pra-rodar', 'registro-emprestimos'].some(path => link.to.includes(path));
          const isRecursosIndependentes = link.to.includes('recursos-independentes');
          const hasEstatisticas = ['biblioteca', 'bota-pra-rodar'].some(path => link.to.includes(path));
          const showGestaoButton = hasGestao && isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS);
          const showRecursosButtons = isRecursosIndependentes && isAuth(userPermissions, UserCategory.AMECICLISTAS);
          const showEstatisticasButton = hasEstatisticas;
          
          return (
            <div key={link.to} className={showGestaoButton || showRecursosButtons || showEstatisticasButton ? "flex gap-2" : ""}>
              <Link
                to={webUser ? link.to : (user?.id ? `${link.to}?userId=${user.id}` : link.to)}
                className={`${showGestaoButton || showRecursosButtons || showEstatisticasButton ? 'flex-1' : 'w-full'} bg-teal-600 text-white px-4 py-3 rounded-md hover:bg-teal-700 transition-colors text-lg font-medium text-center block no-underline`}
              >
                {link.icon} {link.label}
              </Link>
              {showEstatisticasButton && (
                <Link
                  to={link.to.includes('biblioteca') ? '/estatisticas-biblioteca' : '/estatisticas-bota-pra-rodar'}
                  className="bg-blue-500 text-white px-3 py-3 rounded-md hover:bg-blue-600 transition-colors text-lg block no-underline flex items-center justify-center"
                  title="Estatísticas"
                >
                  📊
                </Link>
              )}
              {showGestaoButton && (
                <Link
                  to={`${link.to}?gestao=true`}
                  className="bg-orange-500 text-white px-3 py-3 rounded-md hover:bg-orange-600 transition-colors text-lg block no-underline flex items-center justify-center"
                  title="Gestão"
                >
                  🔧
                </Link>
              )}
              {showRecursosButtons && (
                <>
                  <Link
                    to="/recursos-independentes/meus-consumos"
                    className="bg-purple-500 text-white px-3 py-3 rounded-md hover:bg-purple-600 transition-colors text-lg block no-underline flex items-center justify-center"
                    title="Meus Consumos"
                  >
                    📋
                  </Link>
                  <Link
                    to="/recursos-independentes/historico"
                    className="bg-blue-500 text-white px-3 py-3 rounded-md hover:bg-blue-600 transition-colors text-lg block no-underline flex items-center justify-center"
                    title="Histórico de Vendas"
                  >
                    📊
                  </Link>
                  {isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && (
                    <Link
                      to="/recursos-independentes/gerenciar?gestao=true"
                      className="bg-orange-500 text-white px-3 py-3 rounded-md hover:bg-orange-600 transition-colors text-lg block no-underline flex items-center justify-center"
                      title="Gestão"
                    >
                      🔧
                    </Link>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
