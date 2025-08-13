import { useState, useEffect } from "react";
import { useLoaderData, Form, useSubmit, Link } from "@remix-run/react";
import { UserCategory, type Livro, type Emprestimo, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { bibliotecaLoader } from "~/handlers/loaders/biblioteca";
import { bibliotecaAction } from "~/handlers/actions/biblioteca";
import { BibliotecaGestao } from "~/components/BibliotecaGestao";
import { PaginacaoLivros } from "~/components/PaginacaoLivros";

export const loader = bibliotecaLoader;
export const action = bibliotecaAction;

export default function Biblioteca() {
  const { livros, emprestimos, solicitacoes } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [busca, setBusca] = useState("");
  const [mostrarGestao, setMostrarGestao] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const submit = useSubmit();

  useEffect(() => {
    telegramInit();
    const userData = getTelegramUsersInfo();
    
    // Em desenvolvimento, simular usuário se não houver
    if (process.env.NODE_ENV === "development" && !userData) {
      setUser({
        id: 123456789,
        first_name: "João",
        last_name: "Silva",
        username: "joaosilva"
      } as UserData);
    } else {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Em desenvolvimento, usar ANY_USER para facilitar testes
      if (process.env.NODE_ENV === "development") {
        setUserPermissions([UserCategory.ANY_USER]);
      } else {
        setUserPermissions([UserCategory.AMECICLISTAS]);
      }
    }
  }, [user]);

  const livrosComDisponibilidade = livros.map((livro: Livro) => ({
    ...livro,
    exemplares_disponiveis: livro.exemplares.filter(ex => ex.disponivel && !ex.consulta_local).length,
    total_exemplares: livro.exemplares.filter(ex => !ex.consulta_local).length
  }));

  // Aplicar filtros
  const livrosFiltrados = livrosComDisponibilidade.filter((livro: any) => {
    // Filtro por disponibilidade
    if (filtroDisponibilidade === "disponiveis" && livro.exemplares_disponiveis === 0) return false;
    if (filtroDisponibilidade === "indisponiveis" && livro.exemplares_disponiveis > 0) return false;
    
    // Filtro por tipo
    if (filtroTipo && livro.tipo !== filtroTipo) return false;
    
    // Filtro por ano
    if (filtroAno && livro.ano?.toString() !== filtroAno) return false;
    
    return true;
  });

  // Obter opções únicas para os filtros
  const tiposUnicos = [...new Set(livrosComDisponibilidade.map((l: any) => l.tipo).filter(Boolean))].sort();
  const anosUnicos = [...new Set(livrosComDisponibilidade.map((l: any) => l.ano).filter(Boolean))].sort((a, b) => b - a);

  const handleSolicitar = (subcodigo: string) => {
    const formData = new FormData();
    formData.append("action", "solicitar");
    formData.append("subcodigo", subcodigo);
    submit(formData, { method: "post" });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Biblioteca Ameciclo</h1>
      
      <div className="space-y-3 mb-6">
        <Link 
          to="/" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar
        </Link>
        
        <Link 
          to="/estatisticas-biblioteca" 
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-lg block text-center no-underline"
        >
          📊 Estatísticas
        </Link>
        
        {user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) && (
          <button
            onClick={() => setMostrarGestao(!mostrarGestao)}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-lg"
          >
            🔧 {mostrarGestao ? "Ver Acervo" : "Gestão"}
          </button>
        )}
      </div>

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
                  placeholder="Buscar por título ou autor..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                  <select
                    value={filtroDisponibilidade}
                    onChange={(e) => setFiltroDisponibilidade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="disponiveis">Disponíveis</option>
                    <option value="indisponiveis">Indisponíveis</option>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <select
                    value={filtroAno}
                    onChange={(e) => setFiltroAno(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Todos os anos</option>
                    {anosUnicos.map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {(filtroDisponibilidade !== "todos" || filtroTipo || filtroAno) && (
                <button
                  onClick={() => {
                    setFiltroDisponibilidade("todos");
                    setFiltroTipo("");
                    setFiltroAno("");
                  }}
                  className="mt-3 text-sm text-teal-600 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <PaginacaoLivros 
            livros={livrosFiltrados}
            onSolicitar={handleSolicitar}
            userCanRequest={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
            userId={user?.id}
          />
        </>
      ) : (
        <BibliotecaGestao 
          emprestimos={emprestimos.filter((emp: Emprestimo) => emp.status === 'emprestado')}
          solicitacoes={solicitacoes}
          livros={livrosComDisponibilidade}
        />
      )}
    </div>
  );
}