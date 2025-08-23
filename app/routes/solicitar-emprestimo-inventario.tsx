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
    const telegramUser = getTelegramUsersInfo();
    
    let userId = telegramUser?.id;
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = 123456789;
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
    } else if (process.env.NODE_ENV === "development") {
      setUserPermissions([UserCategory.AMECICLISTAS]);
    }
  }, [user, users]);

  const canRequest = user && isAuth(userPermissions, UserCategory.AMECICLISTAS);

  if (!canRequest) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Acesso Restrito</h2>
          <p className="text-red-700 mb-4">
            Apenas AMECICLISTAS podem solicitar empréstimos de itens do inventário.
          </p>
          <Link 
            to="/registro-emprestimos" 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 no-underline"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Solicitar Empréstimo</h1>
      
      <Link 
        to="/registro-emprestimos" 
        className="button-secondary-full text-center mb-6"
      >
        ⬅️ Voltar
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Detalhes do Item</h2>
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
          <div className="flex items-center mt-4">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${item.disponivel ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`font-semibold ${item.disponivel ? 'text-green-600' : 'text-red-600'}`}>
              {item.disponivel ? 'Disponível' : 'Emprestado'}
            </span>
          </div>
        </div>
      </div>

      {item.disponivel ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar Solicitação</h2>
          <p className="text-gray-600 mb-6">
            Você está prestes a solicitar o empréstimo do item <strong>{item.nome}</strong>.
            {isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) 
              ? " Como você é coordenador de projeto, o empréstimo será aprovado automaticamente."
              : " Sua solicitação será enviada para aprovação de um coordenador de projeto."
            }
          </p>
          
          <Form method="post">
            <input type="hidden" name="codigo" value={item.codigo} />
            <button
              type="submit"
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors text-lg"
            >
              Confirmar Solicitação
            </button>
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
  );
}