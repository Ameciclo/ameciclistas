import { useState, useEffect } from "react";
import { useLoaderData, Form, useActionData, Link, useFetcher, useSearchParams } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getBicicletas, getUsersFirebase, solicitarEmprestimoBicicleta, aprovarSolicitacaoBicicleta, createUserWithAmecicloRegister } from "~/api/firebaseConnection.server";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory, type Bicicleta, type UserData } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import telegramInit from "~/utils/telegramInit";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("codigo");
  const userId = url.searchParams.get("userId");
  
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

    // Buscar dados do usuário no Firebase
    let userData = null;
    let userRole = 'ANY_USER';
    let hasBicycleRegister = false;
    
    if (userId && usersData[userId]) {
      userData = usersData[userId];
      userRole = userData.role || 'ANY_USER';
      hasBicycleRegister = !!(userData.library_register || userData.ameciclo_register);
    }

    return json({ 
      bicicleta: { ...bicicleta, codigo }, 
      users: usersData || {},
      userData,
      userRole,
      hasBicycleRegister
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    throw new Response("Erro interno do servidor", { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  if (action === "buscar_cpf") {
    const cpf = formData.get("cpf") as string;
    
    try {
      const users = await getUsersFirebase();
      let foundUser = null;
      
      if (users) {
        const cpfSemFormatacao = cpf.replace(/\D/g, "");
        
        for (const [userId, userData] of Object.entries(users)) {
          const user = userData as any;
          const userCpf = user.ameciclo_register?.cpf || 
                         user.library_register?.cpf || 
                         user.personal?.cpf;
          
          if (userCpf && userCpf.replace(/\D/g, "") === cpfSemFormatacao) {
            foundUser = { 
              id: userId, 
              nome: user.ameciclo_register?.nome || user.library_register?.nome || user.name,
              email: user.ameciclo_register?.email || user.library_register?.email || "",
              telefone: user.ameciclo_register?.telefone || user.library_register?.telefone || "",
              cpf: userCpf
            };
            break;
          }
        }
      }
      
      return json({ 
        success: true, 
        user: foundUser,
        found: !!foundUser
      });
    } catch (error) {
      return json({ success: false, error: "Erro ao buscar usuário" });
    }
  }
  
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
    
    // Verificar se é solicitação para terceiro
    const action = formData.get("action") as string;
    if (action === "solicitar_terceiro") {
      const cpf_terceiro = formData.get("cpf_terceiro") as string;
      const nome_terceiro = formData.get("nome_terceiro") as string;
      const telefone_terceiro = formData.get("telefone_terceiro") as string;
      const email_terceiro = formData.get("email_terceiro") as string;
      const usuario_terceiro_id = formData.get("usuario_terceiro_id") as string;
      
      let finalUserId = usuario_terceiro_id;
      
      if (!usuario_terceiro_id) {
        finalUserId = `cpf_${cpf_terceiro.replace(/\D/g, "")}`;
        await createUserWithAmecicloRegister(finalUserId, {
          cpf: cpf_terceiro,
          nome: nome_terceiro,
          telefone: telefone_terceiro,
          email: email_terceiro
        });
      }
      
      // Coordenador: criar empréstimo direto
      await aprovarSolicitacaoBicicleta("", parseInt(finalUserId), codigo, true);
      return redirect("/sucesso/emprestimo-bicicleta-solicitado?approved=true");
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
  const { bicicleta, users, userData, userRole, hasBicycleRegister } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [solicitarParaOutraPessoa, setSolicitarParaOutraPessoa] = useState(false);
  const [cpfTerceiro, setCpfTerceiro] = useState("");
  const [dadosTerceiro, setDadosTerceiro] = useState({ id: "", nome: "", telefone: "", email: "", cpf: "" });
  const [buscouCpf, setBuscouCpf] = useState(false);
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  
  const fetcher = useFetcher();
  
  const buscarUsuarioTerceiro = () => {
    if (!validateCPF(cpfTerceiro)) return;
    
    console.log('🔍 Iniciando busca CPF:', cpfTerceiro);
    setBuscandoCpf(true);
    setBuscouCpf(false);
    setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: "" });
    
    const formData = new FormData();
    formData.append("action", "buscar_cpf");
    formData.append("cpf", cpfTerceiro);
    
    fetcher.submit(formData, { method: "post" });
  };
  
  // Processar resultado do fetcher
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      console.log('📋 Resultado da busca via fetcher:', fetcher.data);
      
      if (fetcher.data.success && fetcher.data.user) {
        console.log('✅ Usuário encontrado - processando:', fetcher.data.user);
        const userData = fetcher.data.user;
        const novosDados = {
          id: userData.id || "",
          nome: userData.nome || "",
          telefone: userData.telefone || "",
          email: userData.email || "",
          cpf: userData.cpf || cpfTerceiro
        };
        console.log('✅ Novos dados a serem definidos:', novosDados);
        setDadosTerceiro(novosDados);
        console.log('✅ Estado atualizado');
      } else {
        console.log('❌ Usuário não encontrado');
        setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: cpfTerceiro });
      }
      setBuscouCpf(true);
      setBuscandoCpf(false);
    }
  }, [fetcher.data, fetcher.state, cpfTerceiro]);
  
  // Atualizar estado de loading baseado no fetcher
  useEffect(() => {
    setBuscandoCpf(fetcher.state === "submitting");
  }, [fetcher.state]);
  
  // Verificar se há actionData com resultado de busca anterior
  useEffect(() => {
    if (actionData?.success && actionData?.user && !dadosTerceiro.id) {
      console.log('📋 Usando actionData para preencher dados:', actionData.user);
      const userData = actionData.user;
      setDadosTerceiro({
        id: userData.id || "",
        nome: userData.nome || "",
        telefone: userData.telefone || "",
        email: userData.email || "",
        cpf: userData.cpf || ""
      });
      setBuscouCpf(true);
    }
  }, [actionData]);


  useEffect(() => {
    try {
      // Primeiro tentar pegar userId da URL
      const urlUserId = searchParams.get('userId');
      
      if (urlUserId) {
        // Usuário logado via magic link - usar dados do Firebase
        const userFromUrl = {
          id: parseInt(urlUserId),
          first_name: userData?.ameciclo_register?.nome?.split(' ')[0] || userData?.library_register?.nome?.split(' ')[0] || 'Usuário',
          last_name: userData?.ameciclo_register?.nome?.split(' ').slice(1).join(' ') || userData?.library_register?.nome?.split(' ').slice(1).join(' ') || '',
          username: `user_${urlUserId}`
        } as UserData;
        setUser(userFromUrl);
        console.log('🔗 User from URL/Firebase:', userFromUrl);
      } else {
        // Tentar Telegram Web App
        telegramInit();
        const telegramUser = getTelegramUsersInfo();
        
        if (process.env.NODE_ENV === "development" && !telegramUser) {
          const devUser = {
            id: 999996,
            first_name: "Ana",
            last_name: "Lima",
            username: "dev_999996"
          } as UserData;
          setUser(devUser);
          console.log('🔧 Dev user set:', devUser);
        } else {
          setUser(telegramUser);
          console.log('📱 Telegram user set:', telegramUser);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar usuário:', error);
    } finally {
      setUserLoaded(true);
    }
  }, [searchParams, userData]);



  // Verificar se usuário precisa completar cadastro
  const needsBicycleRegister = user && !hasBicycleRegister && (userRole === 'ANY_USER' || userRole === 'AMECICLISTAS');
  const actuallyNeedsRegister = needsBicycleRegister;
  const canSolicitForOthers = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';



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

  // Se usuário precisa completar cadastro, redirecionar para /user
  if (actuallyNeedsRegister) {
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
                <div className="mt-6 p-4 border-t border-gray-200">
                  <h4 className="text-md font-semibold mb-4">Dados da Pessoa</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cpfTerceiro}
                          onChange={(e) => {
                            const cpfFormatado = formatCPF(e.target.value);
                            setCpfTerceiro(cpfFormatado);
                            setBuscouCpf(false);
                            setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: "" });
                          }}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className={`flex-1 px-3 py-2 border rounded-md ${
                            cpfTerceiro && !validateCPF(cpfTerceiro) ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={buscarUsuarioTerceiro}
                          disabled={!validateCPF(cpfTerceiro) || buscandoCpf}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {buscandoCpf ? 'Buscando...' : 'Buscar'}
                        </button>
                      </div>
                      {cpfTerceiro && !validateCPF(cpfTerceiro) && (
                        <p className="text-sm text-red-600 mt-1">CPF inválido</p>
                      )}
                    </div>
                    
                    {buscandoCpf && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-700">🔍 Buscando usuário...</p>
                      </div>
                    )}
                    
                    {buscouCpf && !buscandoCpf && (
                      <>
                        {dadosTerceiro.id ? (
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm text-green-700 mb-2">✅ Usuário encontrado no cadastro</p>
                            <div className="text-sm">
                              <p><strong>Nome:</strong> {dadosTerceiro.nome}</p>
                              <p><strong>Email:</strong> {dadosTerceiro.email}</p>
                              <p><strong>Telefone:</strong> {dadosTerceiro.telefone}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-yellow-50 p-3 rounded mb-4">
                              <p className="text-sm text-yellow-700">⚠️ Pessoa não encontrada no cadastro</p>
                              <p className="text-xs text-yellow-600 mt-1">Preencha os dados abaixo para cadastrar</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                              <input
                                type="text"
                                value={dadosTerceiro.nome}
                                onChange={(e) => setDadosTerceiro(prev => ({ ...prev, nome: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                              <input
                                type="tel"
                                value={dadosTerceiro.telefone}
                                onChange={(e) => setDadosTerceiro(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
                                placeholder="(81) 99999-9999"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={dadosTerceiro.email}
                                onChange={(e) => setDadosTerceiro(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="usuario@email.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
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
              <input type="hidden" name="action" value={solicitarParaOutraPessoa ? "solicitar_terceiro" : "solicitar"} />
              <input type="hidden" name="codigo" value={bicicleta.codigo} />
              <input type="hidden" name="user_id" value={user?.id?.toString() || searchParams.get('userId') || "999996"} />
              {solicitarParaOutraPessoa && (
                <>
                  <input type="hidden" name="cpf_terceiro" value={cpfTerceiro} />
                  <input type="hidden" name="nome_terceiro" value={dadosTerceiro.nome} />
                  <input type="hidden" name="telefone_terceiro" value={dadosTerceiro.telefone} />
                  <input type="hidden" name="email_terceiro" value={dadosTerceiro.email} />
                  <input type="hidden" name="usuario_terceiro_id" value={dadosTerceiro.id || ""} />
                  <input type="hidden" name="coordinator_id" value={user?.id?.toString() || ""} />
                </>
              )}
              {canSolicitForOthers ? (
                <div className="mb-4">
                  <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <p className="text-green-700 text-sm">
                      ✅ Como coordenador de projeto, sua solicitação será aprovada automaticamente.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={solicitarParaOutraPessoa && (!buscouCpf || (!dadosTerceiro.id && (!dadosTerceiro.nome || !dadosTerceiro.email || !dadosTerceiro.telefone)))}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {buscandoCpf ? 'Buscando...' : 'Confirmar Empréstimo'}
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