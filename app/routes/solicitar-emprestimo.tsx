import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams, Form, useActionData, Link } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getBiblioteca } from "~/api/firebaseConnection.server";
import db from "~/api/firebaseAdmin.server.js";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import type { UserData } from "~/utils/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const livroTitulo = url.searchParams.get("livro");
  const codigo = url.searchParams.get("codigo");
  const userId = url.searchParams.get("userId"); // ID do telegram
  
  if (!livroTitulo || !codigo) {
    throw new Response("Parâmetros inválidos", { status: 400 });
  }

  try {
    const bibliotecaData = await getBiblioteca();
    const livros = bibliotecaData ? Object.keys(bibliotecaData).map(key => ({ id: key, ...bibliotecaData[key] })) : [];
    
    // Encontrar todos os exemplares do mesmo título
    const exemplaresTitulo = livros.filter(l => l.title === livroTitulo);
    
    // Buscar dados do usuário no Firebase
    let userData = null;
    let userRole = 'ANY_USER';
    let hasLibraryRegister = false;
    
    if (userId) {
      try {
        const userRef = db.ref(`subscribers/${userId}`);
        const userSnapshot = await userRef.once("value");
        userData = userSnapshot.val();
        
        if (userData) {
          userRole = userData.role || 'ANY_USER';
          hasLibraryRegister = !!(userData.library_register || userData.ameciclo_register);
          
          // Debug log
          console.log('🔍 User Debug:', {
            userId,
            userRole,
            hasLibraryRegister,
            userData: {
              role: userData.role,
              library_register: !!userData.library_register,
              ameciclo_register: !!userData.ameciclo_register
            }
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }
    
    return json({ 
      livroTitulo, 
      exemplares: exemplaresTitulo,
      userData,
      userRole,
      hasLibraryRegister
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({ livroTitulo, exemplares: [], userData: null, userRole: 'ANY_USER', hasLibraryRegister: false });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  if (action === "solicitar") {
    const subcodigo = formData.get("subcodigo") as string;
    const usuario_id = formData.get("usuario_id") as string;
    
    try {
      
      // Criar solicitação
      const solicitacaoRef = db.ref("biblioteca_solicitacoes");
      await solicitacaoRef.push({
        usuario_id,
        subcodigo,
        data_solicitacao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        created_at: new Date().toISOString()
      });
      
      return redirect("/sucesso/emprestimo-solicitado");
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      return json({ success: false, error: "Erro ao processar solicitação" });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

export default function SolicitarEmprestimo() {
  const { livroTitulo, exemplares, userData, userRole, hasLibraryRegister } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);

  const [exemplaresDisponiveis, setExemplaresDisponiveis] = useState<any[]>([]);
  const [exemplarSelecionado, setExemplarSelecionado] = useState("");
  const [solicitarParaOutraPessoa, setSolicitarParaOutraPessoa] = useState(false);

  useEffect(() => {
    telegramInit();
    const telegramUser = getTelegramUsersInfo();
    
    // Em desenvolvimento, simular dados do usuário
    if (process.env.NODE_ENV === "development" && !telegramUser) {
      setUser({
        id: 123456789,
        first_name: "João",
        last_name: "Silva",
        username: "joaosilva"
      } as UserData);
    } else {
      setUser(telegramUser);
    }
  }, []);

  useEffect(() => {
    // Filtrar exemplares disponíveis (excluir .1 e emprestados)
    const disponiveis = exemplares.filter(ex => {
      // Excluir livros .1 (apenas consulta local)
      if (ex.register.endsWith('.1')) {
        return false;
      }
      // Verificar se está emprestado (simulação - em produção viria do Firebase)
      // Por enquanto, assumir que todos estão disponíveis exceto .1
      return true;
    });
    setExemplaresDisponiveis(disponiveis);
    
    if (disponiveis.length > 0) {
      setExemplarSelecionado(disponiveis[0].register);
    }
  }, [exemplares]);



  // Verificar se usuário precisa completar cadastro
  const needsLibraryRegister = user && !hasLibraryRegister && (userRole === 'ANY_USER' || userRole === 'AMECICLISTAS');
  const canSolicitForOthers = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';
  
  // Coordenadores não precisam de cadastro completo
  const isCoordinator = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';
  const actuallyNeedsRegister = needsLibraryRegister && !isCoordinator;



  // Se usuário precisa completar cadastro
  if (actuallyNeedsRegister) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Cadastro Incompleto</h2>
          <p className="mb-4">Para solicitar empréstimos na biblioteca, você precisa completar seu cadastro com os dados necessários.</p>
        </div>
        
        <div className="flex gap-4">
          <Link 
            to="/user" 
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Completar Cadastro
          </Link>
          <Link 
            to="/biblioteca" 
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Voltar à Biblioteca
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Solicitar Empréstimo</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Livro Selecionado</h2>
        <p className="text-lg text-gray-800">{livroTitulo}</p>
      </div>

      {/* Opções para coordenadores */}
      {canSolicitForOthers && (
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
                to={`/registrar-usuario-biblioteca?livro=${encodeURIComponent(livroTitulo)}&codigo=${searchParams.get("codigo") || ""}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Registrar Novo Usuário
              </Link>
            </div>
          )}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value="solicitar" />
        <input type="hidden" name="usuario_id" value={user?.id || ""} />

        {/* Seleção de Exemplar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Selecione o Exemplar</h3>
          {exemplaresDisponiveis.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">Nenhum exemplar disponível para empréstimo no momento.</p>
              <p className="text-sm text-gray-500">Exemplares terminados em .1 são apenas para consulta local na sede.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exemplaresDisponiveis.map((exemplar) => (
                <label key={exemplar.register} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="subcodigo"
                    value={exemplar.register}
                    checked={exemplarSelecionado === exemplar.register}
                    onChange={(e) => setExemplarSelecionado(e.target.value)}
                    className="text-teal-600"
                  />
                  <div>
                    <span className="font-medium">{exemplar.register}</span>
                    <span className="ml-2 text-sm text-green-600 font-medium">
                      (Disponível para empréstimo)
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>



        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!exemplarSelecionado || exemplaresDisponiveis.length === 0 || solicitarParaOutraPessoa}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirmar Solicitação
          </button>
          <Link
            to="/biblioteca"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  );
}