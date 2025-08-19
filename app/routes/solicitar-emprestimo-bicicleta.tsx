import { useState, useEffect } from "react";
import { useLoaderData, Form, useSubmit, Link } from "@remix-run/react";
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
    const telegramUser = getTelegramUsersInfo();
    
    let userId = telegramUser?.id;
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = 123456789;
      userPermissions = [UserCategory.PROJECT_COORDINATORS];
    } else if (userId && users[userId]) {
      userPermissions = [users[userId].role];
    }

    if (!userId) {
      throw new Error("Usuário não identificado");
    }
    
    // Se é coordenador de projeto, vai direto para emprestado
    if (isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
      await aprovarSolicitacaoBicicleta("", userId, codigo, true);
    } else {
      await solicitarEmprestimoBicicleta(userId, codigo);
    }
    
    return redirect("/sucesso/emprestimo-bicicleta-solicitado");
  } catch (error) {
    console.error("Erro ao solicitar empréstimo:", error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function SolicitarEmprestimoBicicleta() {
  const { bicicleta, users } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const submit = useSubmit();

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
      setUserPermissions([UserCategory.PROJECT_COORDINATORS]);
      setUserInfo({
        ameciclo_register: {
          nome: "João Silva",
          cpf: "123.456.789-00",
          telefone: "(81) 99999-9999",
          email: "joao@example.com"
        }
      });
    }
  }, [user, users]);

  const handleSubmit = () => {
    if (!user) {
      alert("Você precisa estar logado para solicitar empréstimo");
      return;
    }

    const formData = new FormData();
    formData.append("codigo", bicicleta.codigo);
    submit(formData, { method: "post" });
  };

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
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Cadastro Necessário</h1>
          <p className="text-gray-600 mb-4">
            Para solicitar empréstimo de bicicleta, você precisa completar seu cadastro.
          </p>
          <div className="space-y-3">
            <Link 
              to="/registrar-usuario-biblioteca" 
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline"
            >
              Completar Cadastro
            </Link>
            <Link 
              to="/bota-pra-rodar" 
              className="button-secondary-full text-center"
            >
              Voltar para Bota pra Rodar
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
          to="/bota-pra-rodar" 
          className="button-secondary-full text-center mb-6"
        >
          ⬅️ Voltar para Bota pra Rodar
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-teal-600 mb-6">
            🚴♀️ Solicitar Empréstimo de Bicicleta
          </h1>

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
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Seus Dados</h2>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {userData.nome}</p>
              <p><strong>CPF:</strong> {userData.cpf}</p>
              <p><strong>Telefone:</strong> {userData.telefone}</p>
              <p><strong>Email:</strong> {userData.email}</p>
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📋 Termos de Empréstimo
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• O empréstimo é gratuito para membros da Ameciclo</li>
              <li>• Prazo máximo de empréstimo: 7 dias</li>
              <li>• A bicicleta deve ser devolvida nas mesmas condições</li>
              <li>• Em caso de danos, o usuário será responsabilizado</li>
              <li>• O não cumprimento dos prazos pode resultar em suspensão</li>
            </ul>
          </div>

          {/* Botão de Confirmação */}
          <div className="text-center">
            {isCoordinator ? (
              <div className="mb-4">
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-green-700 text-sm">
                    ✅ Como coordenador de projeto, sua solicitação será aprovada automaticamente.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
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
                  onClick={handleSubmit}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors text-lg font-semibold"
                >
                  Solicitar Empréstimo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}