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
  const [activeTab, setActiveTab] = useState<'emprestados' | 'solicitacoes'>('emprestados');

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
      
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('emprestados')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'emprestados' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-500'
          }`}
        >
          Livros Emprestados ({emprestimos.length})
        </button>
        <button
          onClick={() => setActiveTab('solicitacoes')}
          className={`px-4 py-2 font-semibold ml-4 ${
            activeTab === 'solicitacoes' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-500'
          }`}
        >
          Solicitações Pendentes ({solicitacoes.length})
        </button>
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
    </div>
  );
}