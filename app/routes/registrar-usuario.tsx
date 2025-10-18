import { useState, useEffect } from "react";
import { useSearchParams, Form, useActionData, Link } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { 
  getUsersFirebase, 
  getUserById, 
  updateUserAmecicloRegister, 
  createUserWithAmecicloRegister,
  criarSolicitacaoBiblioteca,
  criarSolicitacaoBicicleta
} from "~/api/firebaseConnection.server";
import db from "~/api/firebaseAdmin.server.js";
import { requireAuth } from "~/utils/authMiddleware";
import { UserCategory } from "~/utils/types";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
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
        user: foundUser
      });
    } catch (error) {
      console.log('❌ DIAGNÓSTICO - Erro:', error);
      return json({ success: false, error: "Erro ao buscar usuário" });
    }
  }
  
  if (action === "solicitar") {
    const cpf = formData.get("cpf") as string;
    const nome = formData.get("nome") as string;
    const telefone = formData.get("telefone") as string;
    const email = formData.get("email") as string;
    const userId = formData.get("userId") as string;
    const coordinatorId = formData.get("coordinatorId") as string;
    const isExistingUser = !!userId;
    
    try {
      let finalUserId = userId;
      
      if (!isExistingUser) {
        finalUserId = `cpf_${cpf.replace(/\D/g, "")}`;
        await createUserWithAmecicloRegister(finalUserId, {
          cpf, nome, telefone, email
        });
      }
      
      // Verificar se quem está solicitando é coordenador
      let isCoordinator = false;
      if (coordinatorId) {
        const userRef = db.ref(`subscribers/${coordinatorId}`);
        const userSnapshot = await userRef.once("value");
        const userData = userSnapshot.val();
        const userRole = userData?.role || 'ANY_USER';
        isCoordinator = userRole === 'PROJECT_COORDINATORS' || userRole === 'AMECICLO_COORDINATORS';
      }
      
      const isBicicleta = !!formData.get("bicicleta");
      
      if (isCoordinator) {
        // Coordenador: criar empréstimo direto
        if (isBicicleta) {
          const emprestimoRef = db.ref("emprestimos_bicicletas");
          const emprestimoKey = emprestimoRef.push().key;
          
          const emprestimo = {
            id: emprestimoKey,
            usuario_id: finalUserId,
            codigo_bicicleta: formData.get("bicicleta") as string,
            data_saida: new Date().toISOString().split('T')[0],
            status: 'emprestado'
          };
          
          await emprestimoRef.child(emprestimoKey).update(emprestimo);
        } else {
          const emprestimoRef = db.ref("loan_record");
          const emprestimoKey = emprestimoRef.push().key;
          
          const emprestimo = {
            id: emprestimoKey,
            usuario_id: finalUserId,
            subcodigo: formData.get("subcodigo") as string,
            data_saida: new Date().toISOString().split('T')[0],
            status: 'emprestado'
          };
          
          await emprestimoRef.child(emprestimoKey).update(emprestimo);
        }
        
        return json({ 
          success: true, 
          message: `Empréstimo aprovado para ${nome}!` 
        });
      } else {
        // Usuário comum: criar solicitação
        if (isBicicleta) {
          await criarSolicitacaoBicicleta(finalUserId, formData.get("bicicleta") as string);
        } else {
          await criarSolicitacaoBiblioteca(finalUserId, formData.get("subcodigo") as string);
        }
        
        return json({ 
          success: true, 
          message: `Solicitação registrada para ${nome}!` 
        });
      }
    } catch (error) {
      return json({ success: false, error: "Erro ao processar solicitação" });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

const originalLoader = async ({ request }: LoaderFunctionArgs) => {
  return json({});
};

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);

export default function RegistrarUsuario() {
  const [coordinatorId, setCoordinatorId] = useState("");
  
  useEffect(() => {
    // Pegar coordinator ID da URL ou contexto
    const urlParams = new URLSearchParams(window.location.search);
    const coordId = urlParams.get("coordinatorId");
    if (coordId) {
      setCoordinatorId(coordId);
    }
  }, []);
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [cpf, setCpf] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    telefone: "",
    email: ""
  });
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);

  const livroTitulo = searchParams.get("livro") || "";
  const codigo = searchParams.get("codigo") || "";
  const bicicletaCodigo = searchParams.get("bicicleta") || "";
  const bicicletaNome = searchParams.get("nome") || "";
  
  const isBicicleta = !!bicicletaCodigo;
  const itemTitulo = isBicicleta ? bicicletaNome : livroTitulo;
  const itemCodigo = isBicicleta ? bicicletaCodigo : codigo;

  const buscarUsuario = async (cpfCompleto: string) => {
    if (cpfCompleto.length === 14 && validateCPF(cpfCompleto)) {
      setBuscandoUsuario(true);
      const formData = new FormData();
      formData.append("action", "buscar_cpf");
      formData.append("cpf", cpfCompleto);
      
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        
        if (result.user) {
          setUsuarioEncontrado(result.user);
          setDadosUsuario({
            nome: result.user.nome || "",
            telefone: result.user.telefone || "",
            email: result.user.email || ""
          });
        } else {
          setUsuarioEncontrado(null);
          setDadosUsuario({ nome: "", telefone: "", email: "" });
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
      setBuscandoUsuario(false);
    }
  };

  const handleCpfChange = (valor: string) => {
    const cpfFormatado = formatCPF(valor);
    setCpf(cpfFormatado);
    
    if (cpfFormatado.length === 14) {
      buscarUsuario(cpfFormatado);
    } else {
      setUsuarioEncontrado(null);
      setDadosUsuario({ nome: "", telefone: "", email: "" });
    }
  };

  const isValidForm = () => {
    const isCpfValid = validateCPF(cpf);
    const isNomeValid = dadosUsuario.nome.trim().split(' ').length >= 2;
    const isTelefoneValid = dadosUsuario.telefone.replace(/\D/g, '').length >= 11;
    const isEmailValid = dadosUsuario.email.includes('@') && dadosUsuario.email.includes('.');
    
    return isCpfValid && isNomeValid && isTelefoneValid && isEmailValid;
  };

  if (actionData?.success && actionData?.message) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.message}
        </div>
        <Link to={isBicicleta ? "/bota-pra-rodar" : "/biblioteca"} className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          Voltar {isBicicleta ? "ao Bota pra Rodar" : "à Biblioteca"}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Registrar ou Buscar Usuário</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{isBicicleta ? "Bicicleta Selecionada" : "Livro Selecionado"}</h2>
        <p className="text-lg text-gray-800">{itemTitulo}</p>
        {isBicicleta && <p className="text-sm text-gray-600">Código: {itemCodigo}</p>}
      </div>

      <Form method="post" className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input type="hidden" name="action" value="solicitar" />
        <input type="hidden" name="subcodigo" value={codigo} />
        {isBicicleta && <input type="hidden" name="bicicleta" value={bicicletaCodigo} />}
        {usuarioEncontrado && <input type="hidden" name="userId" value={usuarioEncontrado.id} />}
        <input type="hidden" name="coordinatorId" value={coordinatorId} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
          <input
            type="text"
            name="cpf"
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
            className={`w-full px-3 py-2 border rounded-md ${
              cpf && !validateCPF(cpf) ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {buscandoUsuario && <p className="text-sm text-blue-600 mt-1">Buscando usuário...</p>}
          {cpf && !validateCPF(cpf) && <p className="text-sm text-red-600 mt-1">CPF inválido</p>}
        </div>
        
        {usuarioEncontrado && (
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-700">✅ Usuário encontrado no cadastro</p>
          </div>
        )}
        
        {cpf.length === 14 && validateCPF(cpf) && !usuarioEncontrado && !buscandoUsuario && (
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-yellow-700">⚠️ Pessoa não encontrada no cadastro</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input
            type="text"
            name="nome"
            value={dadosUsuario.nome}
            onChange={(e) => setDadosUsuario(prev => ({ ...prev, nome: e.target.value }))}
            disabled={!!usuarioEncontrado}
            className={`w-full px-3 py-2 border rounded-md ${
              usuarioEncontrado ? 'bg-gray-100' : 'border-gray-300'
            } ${
              dadosUsuario.nome && dadosUsuario.nome.trim().split(' ').length < 2 ? 'border-red-300' : ''
            }`}
            required
          />
          {dadosUsuario.nome && dadosUsuario.nome.trim().split(' ').length < 2 && (
            <p className="text-sm text-red-600 mt-1">Digite nome e sobrenome</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={dadosUsuario.telefone}
            onChange={(e) => setDadosUsuario(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
            disabled={!!usuarioEncontrado}
            placeholder="(81) 99999-9999"
            className={`w-full px-3 py-2 border rounded-md ${
              usuarioEncontrado ? 'bg-gray-100' : 'border-gray-300'
            } ${
              dadosUsuario.telefone && dadosUsuario.telefone.replace(/\D/g, '').length < 11 ? 'border-red-300' : ''
            }`}
            required
          />
          {dadosUsuario.telefone && dadosUsuario.telefone.replace(/\D/g, '').length < 11 && (
            <p className="text-sm text-red-600 mt-1">Telefone deve ter pelo menos 11 dígitos</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={dadosUsuario.email}
            onChange={(e) => setDadosUsuario(prev => ({ ...prev, email: e.target.value }))}
            disabled={!!usuarioEncontrado}
            placeholder="usuario@email.com"
            className={`w-full px-3 py-2 border rounded-md ${
              usuarioEncontrado ? 'bg-gray-100' : 'border-gray-300'
            } ${
              dadosUsuario.email && (!dadosUsuario.email.includes('@') || !dadosUsuario.email.includes('.')) ? 'border-red-300' : ''
            }`}
            required
          />
          {dadosUsuario.email && (!dadosUsuario.email.includes('@') || !dadosUsuario.email.includes('.')) && (
            <p className="text-sm text-red-600 mt-1">Email inválido</p>
          )}
        </div>
        
        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}
        
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!isValidForm()}
            className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {usuarioEncontrado ? `Solicitar empréstimo para ${dadosUsuario.nome}` : 'Cadastrar pessoa e solicitar'}
          </button>
          <Link
            to={isBicicleta ? "/bota-pra-rodar" : "/biblioteca"}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  );
}