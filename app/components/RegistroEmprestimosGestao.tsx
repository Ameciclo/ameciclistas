import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { EmprestimoInventario, SolicitacaoEmprestimoInventario, ItemInventario, UsuarioComDados } from "~/utils/types";

interface RegistroEmprestimosGestaoProps {
  emprestimos: EmprestimoInventario[];
  solicitacoes: SolicitacaoEmprestimoInventario[];
  itens: ItemInventario[];
  users: Record<string, UsuarioComDados>;
}

export function RegistroEmprestimosGestao({ emprestimos, solicitacoes, itens, users }: RegistroEmprestimosGestaoProps) {
  const [abaCadastro, setAbaCadastro] = useState(false);
  const actionData = useActionData();
  const [novoItem, setNovoItem] = useState({
    codigo: "",
    nome: "",
    categoria: "",
    subcategoria: "",
    detalhamento: "",
    descricao: ""
  });
  const [cadastrarAluguel, setCadastrarAluguel] = useState(false);
  const [precoAluguel, setPrecoAluguel] = useState("");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("action") === "cadastrar_item";

  useEffect(() => {
    if (actionData?.success && abaCadastro) {
      setNovoItem({
        codigo: "",
        nome: "",
        categoria: "",
        subcategoria: "",
        detalhamento: "",
        descricao: ""
      });
      setCadastrarAluguel(false);
      setPrecoAluguel("");
    }
  }, [actionData, abaCadastro]);

  const getUserName = (userId: number) => {
    const user = users[userId];
    return user?.name || user?.telegram_user?.first_name || `Usuário ${userId}`;
  };

  const getItemName = (codigo: string) => {
    const item = itens.find(i => i.codigo === codigo);
    return item?.nome || codigo;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Seção:</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAbaCadastro(false)}
              className={`py-2 px-3 rounded text-sm font-medium ${
                !abaCadastro
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Gestão de Empréstimos
            </button>
            <button
              onClick={() => setAbaCadastro(true)}
              className={`py-2 px-3 rounded text-sm font-medium ${
                abaCadastro
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cadastrar Item
            </button>
          </div>
        </div>
      </div>

      {abaCadastro ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Cadastrar Novo Item</h3>
          
          {actionData?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {actionData.success}
            </div>
          )}

          {actionData?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {actionData.error}
            </div>
          )}
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="cadastrar_item" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                name="codigo"
                value={novoItem.codigo}
                onChange={(e) => setNovoItem({...novoItem, codigo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                name="nome"
                value={novoItem.nome}
                onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                name="categoria"
                value={novoItem.categoria}
                onChange={(e) => setNovoItem({...novoItem, categoria: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="oficina mecânica">Oficina mecânica</option>
                <option value="caixotes">Caixotes</option>
                <option value="mobiliário">Mobiliário</option>
                <option value="equipamentos eletrônicos">Equipamentos eletrônicos</option>
                <option value="equipamentos elétricos">Equipamentos elétricos</option>
                <option value="equipamentos em geral">Equipamentos em geral</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
              <input
                type="text"
                name="subcategoria"
                value={novoItem.subcategoria}
                onChange={(e) => setNovoItem({...novoItem, subcategoria: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalhamento</label>
              <textarea
                name="detalhamento"
                value={novoItem.detalhamento}
                onChange={(e) => setNovoItem({...novoItem, detalhamento: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="descricao"
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            
            <div className="border-t pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cadastrarAluguel}
                  onChange={(e) => setCadastrarAluguel(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Também disponibilizar para aluguel</span>
              </label>
            </div>
            
            {cadastrarAluguel && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-blue-900">Dados para Aluguel</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Aluguel (R$) *</label>
                  <input
                    type="number"
                    name="preco_aluguel"
                    step="0.01"
                    min="0"
                    value={precoAluguel}
                    onChange={(e) => setPrecoAluguel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required={cadastrarAluguel}
                  />
                </div>
              </div>
            )}
            
            <input type="hidden" name="cadastrar_aluguel" value={cadastrarAluguel ? "true" : "false"} />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white font-semibold`}
            >
              {isSubmitting ? '⏳ Cadastrando...' : '✅ Cadastrar Item'}
            </button>
          </Form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Solicitações Pendentes */}
          {solicitacoes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Solicitações Pendentes ({solicitacoes.length})</h3>
              <div className="space-y-4">
                {solicitacoes.map((solicitacao) => (
                  <div key={solicitacao.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{getItemName(solicitacao.codigo_item)}</p>
                        <p className="text-sm text-gray-600">Código: {solicitacao.codigo_item}</p>
                        <p className="text-sm text-gray-600">Solicitante: {getUserName(solicitacao.usuario_id)}</p>
                        <p className="text-sm text-gray-600">Data: {solicitacao.data_solicitacao}</p>
                      </div>
                      <div className="flex gap-2">
                        <Form method="post" className="inline">
                          <input type="hidden" name="action" value="aprovar_solicitacao" />
                          <input type="hidden" name="solicitacao_id" value={solicitacao.id} />
                          <button
                            type="submit"
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Aprovar
                          </button>
                        </Form>
                        <Form method="post" className="inline">
                          <input type="hidden" name="action" value="rejeitar_solicitacao" />
                          <input type="hidden" name="solicitacao_id" value={solicitacao.id} />
                          <button
                            type="submit"
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Rejeitar
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empréstimos Ativos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Empréstimos Ativos ({emprestimos.length})</h3>
            {emprestimos.length === 0 ? (
              <p className="text-gray-500">Nenhum empréstimo ativo no momento.</p>
            ) : (
              <div className="space-y-4">
                {emprestimos.map((emprestimo) => (
                  <div key={emprestimo.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{getItemName(emprestimo.codigo_item)}</p>
                        <p className="text-sm text-gray-600">Código: {emprestimo.codigo_item}</p>
                        <p className="text-sm text-gray-600">Usuário: {getUserName(emprestimo.usuario_id)}</p>
                        <p className="text-sm text-gray-600">Data de saída: {emprestimo.data_saida}</p>
                      </div>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="registrar_devolucao" />
                        <input type="hidden" name="emprestimo_id" value={emprestimo.id} />
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Registrar Devolução
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}