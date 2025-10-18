import { useState, useEffect } from "react";
import { useLoaderData, Form, useActionData, Link } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getBicicletas, getUsersFirebase, solicitarEmprestimoBicicleta, aprovarSolicitacaoBicicleta } from "~/api/firebaseConnection.server";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory, type Bicicleta, type UserData } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import telegramInit from "~/utils/telegramInit";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("codigo");
  
  if (!codigo) {
    throw new Response("Código da bicicleta não fornecido", { status: 400 });
  }

  try {
    const bicicletasData = await getBicicletas();
    const usersData = await getUsersFirebase();
    
    const bicicleta = bicicletasData ? bicicletasData[codigo] : null;
    
    if (!bicicleta) {
      throw new Response("Bicicleta não encontrada", { status: 404 });
    }

    return json({ bicicleta: { ...bicicleta, codigo }, users: usersData || {} });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    throw new Response("Erro interno do servidor", { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const codigo = formData.get("codigo") as string;
  
  try {
    const users = await getUsersFirebase();
    
    // Obter userId do formData (mais confiável)
    let userId = formData.get("user_id") as string;
    
    // Se não tiver no formData, tentar do Telegram
    if (!userId) {
      const telegramUser = getTelegramUsersInfo();
      userId = telegramUser?.id?.toString();
    }
    
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = "123456789";
      userPermissions = [UserCategory.PROJECT_COORDINATORS];
    } else if (userId && users[userId]) {
      userPermissions = [users[userId].role];
    }

    if (!userId) {
      throw new Error("Usuário não identificado");
    }
    
    // Se é coordenador de projeto, vai direto para emprestado
    if (isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
      await aprovarSolicitacaoBicicleta("", parseInt(userId), codigo, true);
      return redirect("/sucesso/emprestimo-bicicleta-solicitado?approved=true");
    } else {
      await solicitarEmprestimoBicicleta(parseInt(userId), codigo);
      return redirect("/sucesso/emprestimo-bicicleta-solicitado");
    }
  } catch (error) {
    console.error("Erro ao solicitar empréstimo:", error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function SolicitarEmprestimoBicicleta() {
  const { bicicleta, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
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
            Você precisa estar logado para solicitar empréstimo de bicicleta.
          </p>
          <Link 
            to="/bota-pra-rodar" 
            className="button-secondary-full text-center"
          >
            Voltar para Bota pra Rodar
          </Link>
        </div>
      </div>
    );
  }

  if (!userData || userData.cpf === 'Não informado') {
    window.location.href = '/user';
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          to="/bota-pra-rodar" 
          className="button-secondary-full text-center mb-6"
        >
          ⬅️ Voltar para Bota pra Rodar
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-teal-600 mb-6">
            🚴 Solicitar Empréstimo de Bicicleta
          </h1>
          
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
                    to={`/registrar-usuario?bicicleta=${encodeURIComponent(bicicleta.codigo)}&nome=${encodeURIComponent(bicicleta.nome)}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Registrar Novo Usuário
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Informações da Bicicleta */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Bicicleta Selecionada</h2>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {bicicleta.nome}</p>
              <p><strong>Código:</strong> {bicicleta.codigo}</p>
              <p><strong>Tipo:</strong> {bicicleta.tipo}</p>
              <p><strong>Categoria:</strong> {bicicleta.categoria}</p>
              {bicicleta.descricao && (
                <p><strong>Descrição:</strong> {bicicleta.descricao}</p>
              )}
            </div>
          </div>



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

          {actionData?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {actionData.error}
            </div>
          )}

          {/* Botão de Confirmação */}
          <div className="text-center">
            <Form method="post">
              <input type="hidden" name="codigo" value={bicicleta.codigo} />
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
        </div>
      </div>
    </div>
  );
}