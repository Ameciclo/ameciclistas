import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams, Form, useActionData, Link } from "@remix-run/react";
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getBiblioteca, getUsersFirebase, createUserWithAmecicloRegister, criarSolicitacaoBiblioteca } from "~/api/firebaseConnection.server";
import db from "~/api/firebaseAdmin.server.js";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";
import type { UserData } from "~/utils/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const livroTitulo = url.searchParams.get("livro");
  const codigo = url.searchParams.get("codigo");
  const userId = url.searchParams.get("userId"); // ID do telegram
  
  if (!livroTitulo || !codigo) {
    return json({ livroTitulo: "", exemplares: [], userData: null, userRole: 'ANY_USER', hasLibraryRegister: false });
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
  
  if (process.env.NODE_ENV === "development") {
    console.log('📝 Form data received:', Object.fromEntries(formData));
  }
  
  if (action === "buscar_cpf") {
    const cpf = formData.get("cpf") as string;
    
    try {
      const users = await getUsersFirebase();
      let foundUser = null;
      
      console.log('🔍 DIAGNÓSTICO - Busca CPF:', {
        cpfBuscado: cpf,
        cpfSemFormatacao: cpf.replace(/\D/g, ""),
        totalUsuarios: users ? Object.keys(users).length : 0
      });
      
      if (users) {
        const cpfSemFormatacao = cpf.replace(/\D/g, "");
        let usuariosComCpf = [];
        
        for (const [userId, userData] of Object.entries(users)) {
          const user = userData as any;
          const userCpf = user.ameciclo_register?.cpf || 
                         user.library_register?.cpf || 
                         user.personal?.cpf;
          
          if (userCpf) {
            usuariosComCpf.push({
              userId,
              cpfOriginal: userCpf,
              cpfSemFormatacao: userCpf.replace(/\D/g, ""),
              nome: user.ameciclo_register?.nome || user.library_register?.nome || user.name
            });
          }
          
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
        
        console.log('🔍 DIAGNÓSTICO - Usuários com CPF:', usuariosComCpf);
        console.log('🔍 DIAGNÓSTICO - Usuário encontrado:', foundUser);
      }
      
      return json({ 
        success: true, 
        user: foundUser,
        found: !!foundUser
      });
    } catch (error) {
      console.log('❌ DIAGNÓSTICO - Erro:', error);
      return json({ success: false, error: "Erro ao buscar usuário" });
    }
  }
  
  if (action === "solicitar") {
    const subcodigo = formData.get("subcodigo") as string;
    const usuario_id = formData.get("usuario_id") as string;
    
    if (!usuario_id) {
      console.error('❌ Usuário não identificado');
      return json({ success: false, error: "Usuário não identificado. Verifique se está logado no Telegram." });
    }
    
    if (!subcodigo) {
      console.error('❌ Exemplar não selecionado');
      return json({ success: false, error: "Selecione um exemplar para solicitar." });
    }
    
    try {
      // Verificar se é coordenador para aprovação automática
      const userRef = db.ref(`subscribers/${usuario_id}`);
      const userSnapshot = await userRef.once("value");
      const userData = userSnapshot.val();
      const userRole = userData?.role || 'ANY_USER';
      const isCoordinator = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';
      
      if (isCoordinator) {
        // Coordenadores: criar empréstimo direto
        const emprestimoRef = db.ref("loan_record");
        const emprestimoKey = emprestimoRef.push().key;
        
        const emprestimo = {
          id: emprestimoKey,
          usuario_id,
          subcodigo,
          data_saida: new Date().toISOString().split('T')[0],
          status: 'emprestado',
          created_at: new Date().toISOString()
        };
        
        await emprestimoRef.child(emprestimoKey).update(emprestimo);
        console.log('✅ Empréstimo criado diretamente para coordenador');
        return redirect("/sucesso/emprestimo-aprovado");
      } else {
        // Usuários comuns: criar solicitação
        const solicitacaoData = {
          usuario_id,
          subcodigo,
          data_solicitacao: new Date().toISOString().split('T')[0],
          status: 'pendente',
          created_at: new Date().toISOString()
        };
        
        const solicitacaoRef = db.ref("biblioteca_solicitacoes");
        await solicitacaoRef.push(solicitacaoData);
        console.log('✅ Solicitação criada com sucesso');
        return redirect("/sucesso/emprestimo-solicitado");
      }
    } catch (error) {
      console.error("❌ Erro ao processar solicitação:", error);
      return json({ success: false, error: `Erro ao processar solicitação: ${error.message}` });
    }
  }
  
  if (action === "solicitar_terceiro") {
    const subcodigo = formData.get("subcodigo") as string;
    const coordinator_id = formData.get("coordinator_id") as string;
    const cpf_terceiro = formData.get("cpf_terceiro") as string;
    const nome_terceiro = formData.get("nome_terceiro") as string;
    const telefone_terceiro = formData.get("telefone_terceiro") as string;
    const email_terceiro = formData.get("email_terceiro") as string;
    const usuario_terceiro_id = formData.get("usuario_terceiro_id") as string;
    
    try {
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
      const emprestimoRef = db.ref("loan_record");
      const emprestimoKey = emprestimoRef.push().key;
      
      const emprestimo = {
        id: emprestimoKey,
        usuario_id: finalUserId,
        subcodigo,
        data_saida: new Date().toISOString().split('T')[0],
        status: 'emprestado',
        created_at: new Date().toISOString()
      };
      
      await emprestimoRef.child(emprestimoKey).update(emprestimo);
      console.log('✅ Empréstimo criado diretamente para terceiro por coordenador');
      return redirect("/sucesso/emprestimo-aprovado");
    } catch (error) {
      console.error("❌ Erro ao processar empréstimo para terceiro:", error);
      return json({ success: false, error: `Erro ao processar empréstimo: ${error.message}` });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

export default function SolicitarEmprestimo() {
  const { livroTitulo, exemplares, userData, userRole, hasLibraryRegister } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  const [exemplaresDisponiveis, setExemplaresDisponiveis] = useState<any[]>([]);
  const [exemplarSelecionado, setExemplarSelecionado] = useState("");
  const [solicitarParaOutraPessoa, setSolicitarParaOutraPessoa] = useState(false);
  const [cpfTerceiro, setCpfTerceiro] = useState("");
  const [dadosTerceiro, setDadosTerceiro] = useState({ id: "", nome: "", telefone: "", email: "", cpf: "" });
  const [buscouCpf, setBuscouCpf] = useState(false);
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  
  const buscarUsuarioTerceiro = async () => {
    if (!validateCPF(cpfTerceiro)) return;
    
    setBuscandoCpf(true);
    setBuscouCpf(false);
    setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: "" });
    
    try {
      const formData = new FormData();
      formData.append("action", "buscar_cpf");
      formData.append("cpf", cpfTerceiro);
      
      console.log('🔍 Iniciando busca CPF:', cpfTerceiro);
      
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📋 Resultado da busca:', result);
      console.log('📋 Tipo do resultado:', typeof result);
      console.log('📋 result.success:', result.success);
      console.log('📋 result.user:', result.user);
      console.log('📋 result.user existe?:', !!result.user);
      console.log('📋 result.user é null?:', result.user === null);
      console.log('📋 result.user é undefined?:', result.user === undefined);
      
      if (result.success && result.user) {
        console.log('✅ Usuário encontrado - processando:', result.user);
        const userData = result.user;
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
        console.log('❌ Usuário não encontrado ou erro - limpando estado');
        console.log('❌ Motivo: success =', result.success, ', user =', result.user);
        setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: cpfTerceiro });
      }
      setBuscouCpf(true);
      console.log('🏁 Busca finalizada - buscouCpf definido como true');
      
      // Log do estado final após todas as atualizações
      setTimeout(() => {
        console.log('🔍 Estado final dadosTerceiro:', dadosTerceiro);
      }, 100);
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      setDadosTerceiro({ id: "", nome: "", telefone: "", email: "", cpf: cpfTerceiro });
      setBuscouCpf(true);
    } finally {
      setBuscandoCpf(false);
    }
  };


  useEffect(() => {
    try {
      telegramInit();
      const telegramUser = getTelegramUsersInfo();
      
      // Em desenvolvimento, simular dados do usuário
      if (process.env.NODE_ENV === "development" && !telegramUser) {
        const devUser = {
          id: 123456789,
          first_name: "João",
          last_name: "Silva",
          username: "joaosilva"
        } as UserData;
        setUser(devUser);
        console.log('🔧 Dev user set:', devUser);
      } else {
        setUser(telegramUser);
        console.log('📱 Telegram user set:', telegramUser);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar usuário:', error);
    } finally {
      setUserLoaded(true);
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

  
  // Todos precisam de cadastro completo
  const actuallyNeedsRegister = needsLibraryRegister;
  const canSolicitForOthers = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';



  // Se usuário precisa completar cadastro, redirecionar para /user
  if (actuallyNeedsRegister) {
    window.location.href = '/user';
    return null;
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

      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value={solicitarParaOutraPessoa ? "solicitar_terceiro" : "solicitar"} />
        <input type="hidden" name="usuario_id" value={user?.id?.toString() || ""} />
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

        {/* Seleção de Exemplar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Selecione o Exemplar</h3>
          {exemplaresDisponiveis.length === 0 ? (
            <div className="text-center py-4">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="font-medium mb-2">⚠️ Nenhum exemplar disponível para empréstimo</p>
                <p className="text-sm">Exemplares terminados em .1 são apenas para consulta local na sede.</p>
                <p className="text-sm mt-2">Total de exemplares encontrados: {exemplares.length}</p>
              </div>
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

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 p-4 rounded text-sm mb-4">
            <p>🔍 Debug Info:</p>
            <p>User ID: {user?.id || 'não definido'}</p>
            <p>Exemplar selecionado: {exemplarSelecionado || 'nenhum'}</p>
            <p>Exemplares disponíveis: {exemplaresDisponiveis.length}</p>
            <p>User loaded: {userLoaded ? 'sim' : 'não'}</p>
            <p>Solicitar para terceiro: {solicitarParaOutraPessoa ? 'sim' : 'não'}</p>
            <p>CPF terceiro: {cpfTerceiro || 'vazio'}</p>
            <p>Buscou CPF: {buscouCpf ? 'sim' : 'não'}</p>
            <p>Buscando CPF: {buscandoCpf ? 'sim' : 'não'}</p>
            <p>Usuário encontrado: {dadosTerceiro.id ? 'sim' : 'não'}</p>
            {dadosTerceiro.id && (
              <p>Nome encontrado: {dadosTerceiro.nome}</p>
            )}
            <p>Dados terceiro: {JSON.stringify(dadosTerceiro)}</p>
            <p>dadosTerceiro.id: '{dadosTerceiro.id}'</p>
            <p>dadosTerceiro.id existe: {!!dadosTerceiro.id ? 'sim' : 'não'}</p>
            <p>Botão habilitado: {(!userLoaded || !user?.id || !exemplarSelecionado || exemplaresDisponiveis.length === 0 || (solicitarParaOutraPessoa && (!buscouCpf || (!dadosTerceiro.id && (!dadosTerceiro.nome || !dadosTerceiro.email || !dadosTerceiro.telefone))))) ? 'não' : 'sim'}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!userLoaded || !user?.id || !exemplarSelecionado || exemplaresDisponiveis.length === 0 || (solicitarParaOutraPessoa && (!buscouCpf || (!dadosTerceiro.id && (!dadosTerceiro.nome || !dadosTerceiro.email || !dadosTerceiro.telefone))))}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {!userLoaded ? 'Carregando...' : buscandoCpf ? 'Buscando...' : 'Confirmar Solicitação'}
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