import { useState, useEffect } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { UserCategory, type ItemInventario, type EmprestimoInventario, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { useAuth } from "~/utils/useAuth";
import { requireAuth } from "~/utils/authMiddleware";
import { registroEmprestimosLoader } from "~/handlers/loaders/registro-emprestimos";
import { registroEmprestimosAction } from "~/handlers/actions/registro-emprestimos";
import { RegistroEmprestimosGestao } from "~/components/RegistroEmprestimosGestao";
import { PaginacaoInventario } from "~/components/PaginacaoInventario";

export const loader = requireAuth(UserCategory.AMECICLISTAS)(registroEmprestimosLoader);
export const action = registroEmprestimosAction;

export default function RegistroEmprestimos() {
  const { itens, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const { userPermissions, isDevMode, devUser } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [busca, setBusca] = useState("");
  const [mostrarGestao, setMostrarGestao] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setMostrarGestao(urlParams.get('gestao') === 'true');
  }, []);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    if (isDevMode && devUser) {
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

  const itensComDisponibilidade = itens.map((item: ItemInventario) => {
    return {
      ...item,
      indisponivel: !item.disponivel
    };
  });

  // Aplicar filtros
  const itensFiltrados = itensComDisponibilidade.filter((item: any) => {
    // Filtro por busca
    const buscaLower = busca.toLowerCase();
    const matchBusca = !busca || 
      (item.nome?.toLowerCase() || "").includes(buscaLower) ||
      (item.codigo?.toLowerCase() || "").includes(buscaLower) ||
      (item.categoria?.toLowerCase() || "").includes(buscaLower);
    
    if (!matchBusca) return false;
    
    // Filtro por disponibilidade
    if (filtroDisponibilidade === "disponiveis" && !item.disponivel) return false;
    if (filtroDisponibilidade === "indisponiveis" && item.disponivel) return false;
    
    // Filtro por categoria
    if (filtroCategoria && item.categoria !== filtroCategoria) return false;
    
    return true;
  });

  // Obter opções únicas para os filtros
  const categoriasUnicas = [...new Set(itensComDisponibilidade.map((i: any) => i.categoria).filter(Boolean))].sort();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 mb-6">📦 Registro de Empréstimos</h1>
      


      {!mostrarGestao ? (
        <>
          <div className="mb-6 space-y-4">
            <Form method="get">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="busca"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, código ou categoria..."
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
            
            {/* Filtros */}
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
                    <option value="todos">Todos</option>
                    <option value="disponiveis">Disponíveis</option>
                    <option value="indisponiveis">Emprestados</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Todas as categorias</option>
                    {categoriasUnicas.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {(filtroDisponibilidade !== "todos" || filtroCategoria) && (
                <button
                  onClick={() => {
                    setFiltroDisponibilidade("todos");
                    setFiltroCategoria("");
                  }}
                  className="mt-3 text-sm text-teal-600 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <PaginacaoInventario 
            itens={itensFiltrados}
            onSolicitar={() => {}}
            userCanRequest={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
            userId={user?.id}
          />
        </>
      ) : (
        <RegistroEmprestimosGestao 
          emprestimos={emprestimos.filter((emp: EmprestimoInventario) => emp.status === 'emprestado')}
          solicitacoes={solicitacoes}
          itens={itensComDisponibilidade}
          users={users}
        />
      )}
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu Principal
        </Link>
      </div>
    </div>
  );
}