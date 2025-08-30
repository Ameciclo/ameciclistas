import { useState } from "react";
import { Form } from "@remix-run/react";
import type { EmprestimoBicicleta, SolicitacaoEmprestimoBicicleta, Bicicleta } from "~/utils/types";

interface BotaPraRodarGestaoProps {
  emprestimos: EmprestimoBicicleta[];
  solicitacoes: SolicitacaoEmprestimoBicicleta[];
  bicicletas: Bicicleta[];
  users: any;
}

export function BotaPraRodarGestao({ emprestimos, solicitacoes, bicicletas, users }: BotaPraRodarGestaoProps) {
  const getUserName = (userId: string) => {
    const user = users[userId];
    
    if (process.env.NODE_ENV === "development") {
      console.log(`Buscando usuário ${userId}:`, user);
    }
    
    if (!user) {
      return `Usuário ${userId}`;
    }
    
    if (user.ameciclo_register?.nome) {
      return user.ameciclo_register.nome;
    }
    
    if (user.library_register?.nome) {
      return user.library_register.nome;
    }
    
    if (user.telegram_user) {
      return `${user.telegram_user.first_name} ${user.telegram_user.last_name || ''}`.trim();
    }
    
    return user.name || `Usuário ${userId}`;
  };

  const [activeTab, setActiveTab] = useState<'emprestados' | 'solicitacoes' | 'cadastrar'>('emprestados');

  const getBicicletaInfo = (codigo: string) => {
    return bicicletas.find(b => b.codigo === codigo);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Gestão do Bota pra Rodar</h2>
      
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('emprestados')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'emprestados' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-500'
          }`}
        >
          Bicicletas Emprestadas ({emprestimos.length})
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
        <button
          onClick={() => setActiveTab('cadastrar')}
          className={`px-4 py-2 font-semibold ml-4 ${
            activeTab === 'cadastrar' 
              ? 'text-teal-600 border-b-2 border-teal-600' 
              : 'text-gray-500'
          }`}
        >
          Cadastrar Bicicleta
        </button>
      </div>

      {activeTab === 'emprestados' && (
        <div className="space-y-4">
          {emprestimos.length === 0 ? (
            <p className="text-gray-500">Nenhuma bicicleta emprestada no momento</p>
          ) : (
            emprestimos.map((emp: EmprestimoBicicleta) => {
              const bicicleta = getBicicletaInfo(emp.codigo_bicicleta);
              const diasEmprestado = Math.floor(
                (new Date().getTime() - new Date(emp.data_saida).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={emp.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg mb-2">{bicicleta?.nome || 'Bicicleta não encontrada'}</h4>
                    <p className="text-gray-600 mb-1">Código: <strong>{emp.codigo_bicicleta}</strong></p>
                    <p className="text-gray-600 mb-1">Data de saída: {emp.data_saida}</p>
                    <p className="text-gray-600 mb-1">Solicitante: <strong>{getUserName(emp.usuario_id.toString())}</strong></p>
                    <p className={`text-sm ${diasEmprestado > 7 ? 'text-red-600' : 'text-gray-600'}`}>
                      {diasEmprestado} dias emprestado
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Form method="post" className="inline">
                      <input type="hidden" name="action" value="registrar_devolucao" />
                      <input type="hidden" name="emprestimo_id" value={emp.id} />
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                        onClick={(e) => {
                          if (!confirm('Confirmar devolução da bicicleta?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Registrar Devolução
                      </button>
                    </Form>
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
            solicitacoes.map((sol: SolicitacaoEmprestimoBicicleta) => {
              const bicicleta = getBicicletaInfo(sol.codigo_bicicleta);
              
              return (
                <div key={sol.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg mb-2">{bicicleta?.nome || 'Bicicleta não encontrada'}</h4>
                    <p className="text-gray-600 mb-1">Código: <strong>{sol.codigo_bicicleta}</strong></p>
                    <p className="text-gray-600 mb-1">Data da solicitação: {sol.data_solicitacao}</p>
                    <p className="text-gray-600 mb-1">Solicitante: <strong>{getUserName(sol.usuario_id.toString())}</strong></p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Form method="post" className="inline">
                      <input type="hidden" name="action" value="aprovar_solicitacao" />
                      <input type="hidden" name="solicitacao_id" value={sol.id} />
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                        onClick={(e) => {
                          if (!confirm('Aprovar esta solicitação?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Aprovar
                      </button>
                    </Form>
                    <Form method="post" className="inline">
                      <input type="hidden" name="action" value="rejeitar_solicitacao" />
                      <input type="hidden" name="solicitacao_id" value={sol.id} />
                      <button
                        type="submit"
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                        onClick={(e) => {
                          if (!confirm('Rejeitar esta solicitação?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Rejeitar
                      </button>
                    </Form>
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
            <input type="hidden" name="action" value="cadastrar_bicicleta" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Série *
              </label>
              <input
                type="text"
                name="codigo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: BIC001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome/Apelido *
              </label>
              <input
                type="text"
                name="nome"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Relâmpago"
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
                <option value="Urbana">Urbana</option>
                <option value="Cargueira">Cargueira</option>
                <option value="Mountain Bike">Mountain Bike</option>
                <option value="Speed">Speed</option>
                <option value="Híbrida">Híbrida</option>
                <option value="Dobrável">Dobrável</option>
              </select>
            </div>

            <input type="hidden" name="categoria" value="bicicleta" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="descricao"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descrição adicional da bicicleta..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Cadastrar Bicicleta
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}