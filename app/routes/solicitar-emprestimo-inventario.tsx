import { useState, useEffect } from "react";
import { useLoaderData, Form, Link, useSearchParams } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { UserCategory, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { getItensInventario, getUsersFirebase, criarSolicitacaoInventario } from "~/api/firebaseConnection.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("codigo");
  
  if (!codigo) {
    throw new Response("Código do item não fornecido", { status: 400 });
  }

  try {
    const itensData = await getItensInventario();
    const usersData = await getUsersFirebase();
    
    const item = itensData?.[codigo];
    
    if (!item) {
      throw new Response("Item não encontrado", { status: 404 });
    }

    return json({ 
      item: { codigo, ...item },
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar item:", error);
    throw new Response("Erro interno do servidor", { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const codigo = formData.get("codigo") as string;
  
  try {
    const users = await getUsersFirebase();
    
    let userId = formData.get("user_id") as string;
    
    if (!userId) {
      const telegramUser = getTelegramUsersInfo();
      userId = telegramUser?.id?.toString();
    }
    
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = "123456789";
      userPermissions = [UserCategory.AMECICLISTAS];
    } else if (userId && users[userId]) {
      userPermissions = [users[userId].role];
    }

    if (!userId) {
      throw new Error("Usuário não identificado");
    }

    if (!isAuth(userPermissions, UserCategory.AMECICLISTAS)) {
      throw new Error("Sem permissão para solicitar empréstimos");
    }

    await criarSolicitacaoInventario(userId, codigo);
    
    return redirect("/sucesso/emprestimo-inventario-solicitado");
  } catch (error) {
    console.error("Erro ao solicitar empréstimo:", error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function SolicitarEmprestimoInventario() {
  const { item, users } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [solicitarParaOutraPessoa, setSolicitarParaOutraPessoa] = useState(false);

  useEffect(() => {
    try {
      telegramInit();
      const userData = getTelegramUsersInfo();
      
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
    } catch (error) {
      console.error('Erro ao inicializar Telegram:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user?.id && users[user.id]) {
      const userRole = users[user.id].role;
      setUserPermissions([userRole]);
      setUserInfo(users[user.id]);
    } else if (process.env.NODE_ENV === "development") {
      setUserPermissions([UserCategory.AMECICLISTAS]);
    }
  }, [user, users]);

  const getUserData = () => {
    if (!userInfo) return null;
    
    return {
      nome: userInfo.ameciclo_register?.nome || userInfo.library_register?.nome || userInfo.name || 'Não informado',
      cpf: userInfo.ameciclo_register?.cpf || userInfo.library_register?.cpf || userInfo.personal?.cpf || 'Não informado',
      telefone: userInfo.ameciclo_register?.telefone || userInfo.library_register?.telefone || userInfo.personal?.telefone || 'Não informado',
      email: userInfo.ameciclo_register?.email || userInfo.library_register?.email || 'Não informado'
    };
  };

  const userData = getUserData();
  const isCoordinator = isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS);

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para solicitar empréstimo.
          </p>
          <Link 
            to="/registro-emprestimos" 
            className="button-secondary-full text-center"
          >
            Voltar para Registro de Empréstimos
          </Link>
        </div>
      </div>
    );
  }

  if (!userData || userData.cpf === 'Não informado') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Cadastro Necessário</h1>
          <p className="text-gray-600 mb-4">
            Para solicitar empréstimo, você precisa completar seu cadastro.
          </p>
          <div className="space-y-3">
            <Link 
              to="/registrar-usuario-biblioteca" 
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline"
            >
              Completar Cadastro
            </Link>
            <Link 
              to="/registro-emprestimos" 
              className="button-secondary-full text-center"
            >
              Voltar para Registro de Empréstimos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          to="/registro-emprestimos" 
          className="button-secondary-full text-center mb-6"
        >
          ⬅️ Voltar para Registro de Empréstimos
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-teal-600 mb-6">
            📦 Solicitar Empréstimo de Item
          </h1>
          
          {/* Informações do Item */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Item Selecionado</h2>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {item.nome}</p>
              <p><strong>Código:</strong> {item.codigo}</p>
              <p><strong>Categoria:</strong> {item.categoria}</p>
              {item.subcategoria && (
                <p><strong>Subcategoria:</strong> {item.subcategoria}</p>
              )}
              {item.detalhamento && (
                <p><strong>Detalhamento:</strong> {item.detalhamento}</p>
              )}
              {item.descricao && (
                <p><strong>Descrição:</strong> {item.descricao}</p>
              )}
            </div>
          </div>

          {/* Opções para coordenadores */}
          {isCoordinator && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Opções de Solicitação</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="tipoSolicitacao"
                    checked={!solicitarParaOutraPessoa}
                    onChange={() => setSolicitarParaOutraPessoa(false)}
                    className="text-teal-600"
                  />
                  <span>Solicitar para mim</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="tipoSolicitacao"
                    checked={solicitarParaOutraPessoa}
                    onChange={() => setSolicitarParaOutraPessoa(true)}
                    className="text-teal-600"
                  />
                  <span>Solicitar para outra pessoa</span>
                </label>
              </div>
              
              {solicitarParaOutraPessoa && (
                <div className="mt-4">
                  <Link 
                    to={`/registrar-usuario-biblioteca?item=${encodeURIComponent(item.codigo)}&nome=${encodeURIComponent(item.nome)}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Registrar Novo Usuário
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Informações do Usuário */}
          {!solicitarParaOutraPessoa && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Seus Dados</h2>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {userData.nome}</p>
                <p><strong>CPF:</strong> {userData.cpf}</p>
                <p><strong>Telefone:</strong> {userData.telefone}</p>
                <p><strong>Email:</strong> {userData.email}</p>
              </div>
            </div>
          )}

          {item.disponivel ? (
            <div className="text-center">
              <Form method="post">
                <input type="hidden" name="codigo" value={item.codigo} />
                <input type="hidden" name="user_id" value={user?.id || ""} />
                {isCoordinator ? (
                  <div className="mb-4">
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <p className="text-green-700 text-sm">
                        ✅ Como coordenador de projeto, sua solicitação será aprovada automaticamente.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={solicitarParaOutraPessoa}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Confirmar Empréstimo
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                      <p className="text-yellow-700 text-sm">
                        ⏳ Sua solicitação será enviada para aprovação da coordenação.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={solicitarParaOutraPessoa}
                      className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Solicitar Empréstimo
                    </button>
                  </div>
                )}
              </Form>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-800 mb-2">Item Indisponível</h2>
              <p className="text-red-700">
                Este item está atualmente emprestado e não pode ser solicitado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}