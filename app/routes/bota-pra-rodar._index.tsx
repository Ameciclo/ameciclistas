import { useState, useEffect } from "react";
import { useLoaderData, Form, useSubmit, Link } from "@remix-run/react";
import { UserCategory, type Bicicleta, type EmprestimoBicicleta, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";
import { botaPraRodarAction } from "~/handlers/actions/bota-pra-rodar";
import { PaginacaoBicicletas } from "~/components/PaginacaoBicicletas";
import { useDevUser } from "~/utils/useDevUser";
import { createDevTelegramUserWithCategories } from "~/utils/devTelegram";

export const loader = botaPraRodarLoader;
export const action = botaPraRodarAction;

export default function BotaPraRodarIndex() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [busca, setBusca] = useState("");
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("");

  const submit = useSubmit();

  const { devUser, isDevMode } = useDevUser();

  useEffect(() => {
    if (isDevMode && devUser) {
      const devTelegramUser = createDevTelegramUserWithCategories(devUser);
      setUserPermissions(devTelegramUser.categories);
      setUser({
        id: devUser.id,
        first_name: devUser.name.split(" ")[0],
        last_name: devUser.name.split(" ").slice(1).join(" ")
      });
    } else {
      try {
        telegramInit();
        const userData = getTelegramUsersInfo();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao inicializar Telegram:', error);
        setUser(null);
      }
    }
  }, [devUser, isDevMode]);

  useEffect(() => {
    if (!isDevMode && user?.id && users[user.id]) {
      const userRole = users[user.id].role;
      setUserPermissions([userRole]);
    }
  }, [user, users, isDevMode]);

  const bicicletasComDisponibilidade = bicicletas.map((bicicleta: Bicicleta) => {
    return {
      ...bicicleta,
      indisponivel: !bicicleta.disponivel
    };
  });

  const bicicletasFiltradas = bicicletasComDisponibilidade.filter((bicicleta: any) => {
    if (filtroDisponibilidade === "disponiveis" && !bicicleta.disponivel) return false;
    if (filtroDisponibilidade === "indisponiveis" && bicicleta.disponivel) return false;
    if (filtroTipo && bicicleta.tipo !== filtroTipo) return false;
    return true;
  });

  const tiposUnicos = [...new Set(bicicletasComDisponibilidade.map((b: any) => b.tipo).filter(Boolean))].sort();

  return (
    <>
      <h1 className="text-3xl font-bold text-teal-600 mb-6">🚴‍♀️ Bota pra Rodar</h1>

      <div className="mb-6 space-y-4">
        <Form method="get">
          <div className="flex gap-2">
            <input
              type="text"
              name="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              Buscar
            </button>
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Limpar
              </button>
            )}
          </div>
        </Form>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
              <select
                value={filtroDisponibilidade}
                onChange={(e) => setFiltroDisponibilidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todas</option>
                <option value="disponiveis">Disponíveis</option>
                <option value="indisponiveis">Emprestadas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Todos os tipos</option>
                {tiposUnicos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(filtroDisponibilidade !== "todos" || filtroTipo) && (
            <button
              onClick={() => {
                setFiltroDisponibilidade("todos");
                setFiltroTipo("");
              }}
              className="mt-3 text-sm text-teal-600 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <PaginacaoBicicletas 
        bicicletas={bicicletasFiltradas}
        onSolicitar={() => {}}
        userCanRequest={!!user && (isDevMode || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
        userId={user?.id}
      />
    </>
  );
}
