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

  const livrosDisponiveis = livros.map((livro: Livro) => ({
    ...livro,
    exemplares_disponiveis: livro.exemplares.filter(ex => ex.disponivel && !ex.consulta_local).length,
    total_exemplares: livro.exemplares.filter(ex => !ex.consulta_local).length
  }));

  const handleSolicitar = (subcodigo: string) => {
    const formData = new FormData();
    formData.append("action", "solicitar");
    formData.append("subcodigo", subcodigo);
    submit(formData, { method: "post" });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-600">Biblioteca Ameciclo</h1>
        <div className="flex gap-2">
          <Link 
            to="/estatisticas-biblioteca" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Estatísticas
          </Link>
          {user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) && (
            <button
              onClick={() => setMostrarGestao(!mostrarGestao)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              {mostrarGestao ? "Ver Acervo" : "Gestão"}
            </button>
          )}
        </div>
      </div>

      {!mostrarGestao ? (
        <>
          <Form method="get" className="mb-6">
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

          <PaginacaoLivros 
            livros={livrosDisponiveis}
            onSolicitar={handleSolicitar}
            userCanRequest={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
          />
        </>
      ) : (
        <BibliotecaGestao 
          emprestimos={emprestimos.filter((emp: Emprestimo) => emp.status === 'emprestado')}
          solicitacoes={solicitacoes}
          livros={livrosDisponiveis}
        />
      )}
    </div>
  );
}