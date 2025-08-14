import { useState, useEffect } from "react";
import { useSearchParams, Form, useActionData, Link } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import db from "~/api/firebaseAdmin.server.js";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  if (action === "buscar_cpf") {
    const cpf = formData.get("cpf") as string;
    
    try {
      // Buscar usuário por CPF nos dados existentes
      const users = await getUsersFirebase();
      let foundUser = null;
      
      if (users) {
        for (const [userId, userData] of Object.entries(users)) {
          const user = userData as any;
          // Buscar em ameciclo_register, library_register ou personal (para compatibilidade)
          const userCpf = user.ameciclo_register?.cpf || 
                         user.library_register?.cpf || 
                         user.personal?.cpf;
          
          if (userCpf === cpf) {
            foundUser = { id: userId, ...user };
            break;
          }
        }
      }
      
      return json({ 
        success: true, 
        user: foundUser,
        cpf 
      });
    } catch (error) {
      return json({ success: false, error: "Erro ao buscar usuário" });
    }
  }
  
  if (action === "criar_usuario") {
    const cpf = formData.get("cpf") as string;
    const nome = formData.get("nome") as string;
    const telefone = formData.get("telefone") as string;
    const email = formData.get("email") as string;
    const subcodigo = formData.get("subcodigo") as string;
    
    try {
      // Gerar ID único baseado no CPF
      const userId = `cpf_${cpf.replace(/\D/g, "")}`;
      
      // Criar usuário no Firebase
      const userRef = db.ref(`subscribers/${userId}`);
      await userRef.set({
        id: userId,
        name: nome,
        role: "ANY_USER",
        ameciclo_register: {
          cpf,
          nome,
          telefone,
          email,
          created_at: new Date().toISOString()
        }
      });
      
      // Criar solicitação de empréstimo
      const solicitacaoRef = db.ref("biblioteca_solicitacoes");
      await solicitacaoRef.push({
        usuario_id: userId,
        subcodigo,
        data_solicitacao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        created_at: new Date().toISOString()
      });
      
      return json({ 
        success: true, 
        message: "Usuário criado e solicitação registrada com sucesso!" 
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return json({ success: false, error: "Erro ao criar usuário" });
    }
  }
  
  if (action === "solicitar_existente") {
    const userId = formData.get("userId") as string;
    const subcodigo = formData.get("subcodigo") as string;
    
    try {
      const solicitacaoRef = db.ref("biblioteca_solicitacoes");
      await solicitacaoRef.push({
        usuario_id: userId,
        subcodigo,
        data_solicitacao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        created_at: new Date().toISOString()
      });
      
      return json({ 
        success: true, 
        message: "Solicitação registrada com sucesso!" 
      });
    } catch (error) {
      return json({ success: false, error: "Erro ao registrar solicitação" });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

export default function RegistrarUsuarioBiblioteca() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [cpf, setCpf] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    telefone: "",
    email: ""
  });
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const livroTitulo = searchParams.get("livro") || "";
  const codigo = searchParams.get("codigo") || "";

  useEffect(() => {
    if (actionData?.user) {
      setUsuarioEncontrado(actionData.user);
      setMostrarFormulario(false);
    } else if (actionData?.success && actionData?.cpf && !actionData?.user) {
      setMostrarFormulario(true);
      setUsuarioEncontrado(null);
    }
  }, [actionData]);

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  if (actionData?.success && actionData?.message) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.message}
        </div>
        <Link to="/biblioteca" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          Voltar à Biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Registrar Usuário da Biblioteca</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Livro Selecionado</h2>
        <p className="text-lg text-gray-800">{livroTitulo}</p>
      </div>

      {/* Busca por CPF */}
      {!usuarioEncontrado && !mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Buscar por CPF</h3>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="buscar_cpf" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              Buscar Usuário
            </button>
          </Form>
        </div>
      )}

      {/* Usuário encontrado */}
      {usuarioEncontrado && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-green-800">Usuário Encontrado</h3>
          <div className="space-y-2 mb-4">
            <p><strong>Nome:</strong> {usuarioEncontrado.ameciclo_register?.nome || usuarioEncontrado.library_register?.nome || usuarioEncontrado.name || "Não informado"}</p>
            <p><strong>CPF:</strong> {usuarioEncontrado.ameciclo_register?.cpf || usuarioEncontrado.library_register?.cpf || usuarioEncontrado.personal?.cpf || "Não informado"}</p>
            <p><strong>Telefone:</strong> {usuarioEncontrado.ameciclo_register?.telefone || usuarioEncontrado.library_register?.telefone || usuarioEncontrado.personal?.telefone || "Não informado"}</p>
            <p><strong>Email:</strong> {usuarioEncontrado.ameciclo_register?.email || usuarioEncontrado.library_register?.email || "Não informado"}</p>
          </div>
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="solicitar_existente" />
            <input type="hidden" name="userId" value={usuarioEncontrado.id} />
            <input type="hidden" name="subcodigo" value={codigo} />
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Registrar Empréstimo
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsuarioEncontrado(null);
                  setCpf("");
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Buscar Outro CPF
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Formulário para novo usuário */}
      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Cadastrar Novo Usuário</h3>
          <p className="text-gray-600 mb-4">CPF não encontrado. Preencha os dados abaixo para criar um novo cadastro:</p>
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="criar_usuario" />
            <input type="hidden" name="cpf" value={cpf} />
            <input type="hidden" name="subcodigo" value={codigo} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                value={cpf}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                name="nome"
                value={dadosUsuario.nome}
                onChange={(e) => setDadosUsuario(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={dadosUsuario.telefone}
                onChange={(e) => setDadosUsuario(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }))}
                placeholder="(81) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={dadosUsuario.email}
                onChange={(e) => setDadosUsuario(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
              >
                Criar Usuário e Registrar Empréstimo
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setCpf("");
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </Form>
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <div className="flex gap-4">
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