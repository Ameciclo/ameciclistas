import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams, Form, useActionData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getBiblioteca } from "~/api/firebaseConnection.server";
import db from "~/api/firebaseAdmin.server.js";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import type { UserData } from "~/utils/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const livroTitulo = url.searchParams.get("livro");
  const codigo = url.searchParams.get("codigo");
  
  if (!livroTitulo || !codigo) {
    throw new Response("Parâmetros inválidos", { status: 400 });
  }

  try {
    const bibliotecaData = await getBiblioteca();
    const livros = bibliotecaData ? Object.keys(bibliotecaData).map(key => ({ id: key, ...bibliotecaData[key] })) : [];
    
    // Encontrar todos os exemplares do mesmo título
    const exemplaresTitulo = livros.filter(l => l.title === livroTitulo);
    
    return json({ livroTitulo, exemplares: exemplaresTitulo });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({ livroTitulo, exemplares: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  if (action === "solicitar") {
    const subcodigo = formData.get("subcodigo") as string;
    const usuario_id = formData.get("usuario_id") as string;
    const cpf = formData.get("cpf") as string;
    const telefone = formData.get("telefone") as string;
    
    try {
      // Salvar dados pessoais se fornecidos
      if (cpf || telefone) {
        const userRef = db.ref(`subscribers/${usuario_id}/personal`);
        await userRef.update({
          cpf: cpf || null,
          telefone: telefone || null,
          updated_at: new Date().toISOString()
        });
      }
      
      // Criar solicitação
      const solicitacaoRef = db.ref("biblioteca_solicitacoes");
      await solicitacaoRef.push({
        usuario_id,
        subcodigo,
        data_solicitacao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        created_at: new Date().toISOString()
      });
      
      return json({ success: true, message: "Solicitação enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      return json({ success: false, error: "Erro ao processar solicitação" });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

export default function SolicitarEmprestimo() {
  const { livroTitulo, exemplares } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [dadosPessoais, setDadosPessoais] = useState({ cpf: "", telefone: "" });
  const [exemplaresDisponiveis, setExemplaresDisponiveis] = useState<any[]>([]);
  const [exemplarSelecionado, setExemplarSelecionado] = useState("");

  useEffect(() => {
    telegramInit();
    const userData = getTelegramUsersInfo();
    setUser(userData);
    
    // Em desenvolvimento, simular dados do usuário
    if (process.env.NODE_ENV === "development" && !userData) {
      setUser({
        id: 123456789,
        first_name: "João",
        last_name: "Silva",
        username: "joaosilva"
      } as UserData);
    }
  }, []);

  useEffect(() => {
    // Filtrar exemplares disponíveis
    const disponiveis = exemplares.filter(ex => {
      // Simular disponibilidade (em produção viria do Firebase)
      return true;
    });
    setExemplaresDisponiveis(disponiveis);
    
    if (disponiveis.length > 0) {
      setExemplarSelecionado(disponiveis[0].register);
    }
  }, [exemplares]);

  useEffect(() => {
    // Buscar dados pessoais do Firebase (simulado em dev)
    if (user?.id && process.env.NODE_ENV === "development") {
      // Simular dados existentes ou não
      setDadosPessoais({ cpf: "", telefone: "" });
    }
  }, [user]);

  if (actionData?.success) {
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
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Solicitar Empréstimo</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Livro Selecionado</h2>
        <p className="text-lg text-gray-800">{livroTitulo}</p>
      </div>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value="solicitar" />
        <input type="hidden" name="usuario_id" value={user?.id || ""} />

        {/* Seleção de Exemplar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Selecione o Exemplar</h3>
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
                  {exemplar.register.endsWith('.1') && (
                    <span className="ml-2 text-sm text-orange-600 font-medium">
                      (Disponível para leitura na sede)
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dados do Usuário */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Seus Dados</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={`${user?.first_name || ""} ${user?.last_name || ""}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                name="cpf"
                value={dadosPessoais.cpf}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={dadosPessoais.telefone}
                onChange={(e) => setDadosPessoais(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!exemplarSelecionado || exemplarSelecionado.endsWith('.1')}
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