import { useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import type { Emprestimo, SolicitacaoEmprestimo, Livro } from "~/utils/types";

interface BibliotecaGestaoProps {
  emprestimos: Emprestimo[];
  solicitacoes: SolicitacaoEmprestimo[];
  livros: Livro[];
  users: any;
}

export function BibliotecaGestao({ emprestimos, solicitacoes, livros, users }: BibliotecaGestaoProps) {
  const getUserName = (userId: string) => {
    const user = users[userId];
    
    // Debug: log da estrutura do usuário
    if (process.env.NODE_ENV === "development") {
      console.log(`Buscando usuário ${userId}:`, user);
    }
    
    if (!user) {
      return `Usuário ${userId}`;
    }
    
    // Priorizar dados do registro ameciclo
    if (user.ameciclo_register?.nome) {
      return user.ameciclo_register.nome;
    }
    
    // Depois dados do registro da biblioteca (para compatibilidade)
    if (user.library_register?.nome) {
      return user.library_register.nome;
    }
    
    // Depois dados do telegram
    if (user.telegram_user) {
      return `${user.telegram_user.first_name} ${user.telegram_user.last_name || ''}`.trim();
    }
    
    // Por último, nome genérico ou ID
    return user.name || `Usuário ${userId}`;
  };

  const getUserInfo = (userId: string) => {
    const user = users[userId];
    if (!user) return null;
    
    return {
      nome: user.ameciclo_register?.nome || user.library_register?.nome || user.name || 'Não informado',
      cpf: user.ameciclo_register?.cpf || user.library_register?.cpf || user.personal?.cpf || 'Não informado',
      telefone: user.ameciclo_register?.telefone || user.library_register?.telefone || user.personal?.telefone || 'Não informado',
      email: user.ameciclo_register?.email || user.library_register?.email || 'Não informado'
    };
  };
  const [activeTab, setActiveTab] = useState<'emprestados' | 'solicitacoes' | 'cadastrar'>('emprestados');

  const submit = useSubmit();

  const handleRegistrarDevolucao = (emprestimoId: string) => {
    const formData = new FormData();
    formData.append("action", "registrar_devolucao");
    formData.append("emprestimo_id", emprestimoId);
    submit(formData, { method: "post" });
  };

  const handleAprovarSolicitacao = (solicitacaoId: string) => {
    const formData = new FormData();
    formData.append("action", "aprovar_solicitacao");
    formData.append("solicitacao_id", solicitacaoId);
    submit(formData, { method: "post" });
  };

  const getLivroInfo = (subcodigo: string) => {
    // Buscar livro pelo subcodigo exato ou pelo código base
    return livros.find(l => 
      l.exemplares?.some(ex => ex.subcodigo === subcodigo) ||
      l.codigo === subcodigo ||
      l.codigo === subcodigo.split('.')[0]
    );
  };

  const handleRejeitarSolicitacao = (solicitacaoId: string) => {
    const formData = new FormData();
    formData.append("action", "rejeitar_solicitacao");
    formData.append("solicitacao_id", solicitacaoId);
    submit(formData, { method: "post" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Gestão da Biblioteca</h2>
      
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Seção:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('emprestados')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                activeTab === 'emprestados'
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Livros Emprestados ({emprestimos.length})
            </button>
            <button
              onClick={() => setActiveTab('solicitacoes')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                activeTab === 'solicitacoes'
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Solicitações Pendentes ({solicitacoes.length})
            </button>
            <button
              onClick={() => setActiveTab('cadastrar')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                activeTab === 'cadastrar'
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cadastrar Livro
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'emprestados' && (
        <div className="space-y-4">
          {emprestimos.length === 0 ? (
            <p className="text-gray-500">Nenhum livro emprestado no momento</p>
          ) : (
            emprestimos.map((emp: Emprestimo) => {
              const livro = getLivroInfo(emp.subcodigo);
              const diasEmprestado = Math.floor(
                (new Date().getTime() - new Date(emp.data_saida).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={emp.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg mb-2">{livro?.titulo || emp.titulo || 'Título não encontrado'}</h4>
                    <p className="text-gray-600 mb-1">Código: <strong>{emp.subcodigo}</strong></p>
                    <p className="text-gray-600 mb-1">Data de saída: {emp.data_saida}</p>
                    <p className="text-gray-600 mb-1">Solicitante: <strong>{getUserName(emp.usuario_id)}</strong></p>
                    <p className={`text-sm ${diasEmprestado > 30 ? 'text-red-600' : 'text-gray-600'}`}>
                      {diasEmprestado} dias emprestado
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleRegistrarDevolucao(emp.id)}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                      Registrar Devolução
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'solicitacoes' && (
        <div className="space-y-4">
          {solicitacoes.length === 0 ? (
            <p className="text-gray-500">Nenhuma solicitação pendente</p>
          ) : (
            solicitacoes.map((sol: SolicitacaoEmprestimo) => {
              const livro = getLivroInfo(sol.subcodigo);
              
              return (
                <div key={sol.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg mb-2">{livro?.titulo || 'Título não encontrado'}</h4>
                    <p className="text-gray-600 mb-1">Código: <strong>{sol.subcodigo}</strong></p>
                    <p className="text-gray-600 mb-1">Data da solicitação: {sol.data_solicitacao}</p>
                    <p className="text-gray-600 mb-1">Solicitante: <strong>{getUserName(sol.usuario_id)}</strong></p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleAprovarSolicitacao(sol.id)}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleRejeitarSolicitacao(sol.id)}
                      className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'cadastrar' && (
        <div className="max-w-md mx-auto">
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="cadastrar_livro" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Dom Casmurro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autor *
              </label>
              <input
                type="text"
                name="autor"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Machado de Assis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código/Registro *
              </label>
              <input
                type="text"
                name="codigo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: LIT001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <input
                type="number"
                name="ano"
                min="1000"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="tipo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione o tipo</option>
                <option value="Livro">Livro</option>
                <option value="Revista">Revista</option>
                <option value="Artigo">Artigo</option>
                <option value="Manual">Manual</option>
                <option value="Relatório">Relatório</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 978-85-123-4567-8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resumo
              </label>
              <textarea
                name="resumo"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Breve descrição do livro..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="consulta_local"
                id="consulta_local"
                className="mr-2"
              />
              <label htmlFor="consulta_local" className="text-sm text-gray-700">
                Disponível apenas para consulta local
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Cadastrar Livro
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}