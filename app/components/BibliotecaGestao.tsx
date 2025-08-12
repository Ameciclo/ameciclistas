import { useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import type { Emprestimo, SolicitacaoEmprestimo, Livro } from "~/utils/types";

interface BibliotecaGestaoProps {
  emprestimos: Emprestimo[];
  solicitacoes: SolicitacaoEmprestimo[];
  livros: Livro[];
}

export function BibliotecaGestao({ emprestimos, solicitacoes, livros }: BibliotecaGestaoProps) {
  const [activeTab, setActiveTab] = useState<'emprestados' | 'solicitacoes'>('emprestados');
  const [nomeRetirada, setNomeRetirada] = useState<{[key: string]: string}>({});
  const submit = useSubmit();

  const handleRegistrarDevolucao = (emprestimoId: string) => {
    const formData = new FormData();
    formData.append("action", "registrar_devolucao");
    formData.append("emprestimo_id", emprestimoId);
    submit(formData, { method: "post" });
  };

  const handleAprovarSolicitacao = (solicitacaoId: string) => {
    const nome = nomeRetirada[solicitacaoId] || "";
    if (!nome.trim()) {
      alert("Por favor, informe o nome de quem está retirando o livro");
      return;
    }
    
    const formData = new FormData();
    formData.append("action", "aprovar_solicitacao");
    formData.append("solicitacao_id", solicitacaoId);
    formData.append("nome_retirada", nome);
    submit(formData, { method: "post" });
  };

  const getLivroInfo = (subcodigo: string) => {
    const codigo = subcodigo.split('.')[0];
    return livros.find(l => l.codigo === codigo);
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{livro?.titulo}</h4>
                      <p className="text-gray-600">Código: <strong>{emp.subcodigo}</strong></p>
                      <p className="text-gray-600">Autor: {livro?.autor}</p>
                      <p className="text-gray-600">Data de saída: {emp.data_saida}</p>
                      <p className={`text-sm ${diasEmprestado > 30 ? 'text-red-600' : 'text-gray-600'}`}>
                        {diasEmprestado} dias emprestado
                      </p>
                    </div>
                    <button
                      onClick={() => handleRegistrarDevolucao(emp.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{livro?.titulo}</h4>
                      <p className="text-gray-600">Código: <strong>{sol.subcodigo}</strong></p>
                      <p className="text-gray-600">Autor: {livro?.autor}</p>
                      <p className="text-gray-600">Data da solicitação: {sol.data_solicitacao}</p>
                      <p className="text-gray-600">Usuário ID: {sol.usuario_id}</p>
                    </div>
                    <div className="ml-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Nome de quem retira"
                        value={nomeRetirada[sol.id] || ""}
                        onChange={(e) => setNomeRetirada(prev => ({
                          ...prev,
                          [sol.id]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprovarSolicitacao(sol.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Aprovar
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                          Rejeitar
                        </button>
                      </div>
                    </div>
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