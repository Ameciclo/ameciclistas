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
  const [novoItem, setNovoItem] = useState({
    codigo: "",
    nome: "",
    categoria: "",
    subcategoria: "",
    detalhamento: "",
    descricao: ""
  });
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (!isSubmitting && navigation.state === "idle" && abaCadastro) {
      // Verifica se acabou de submeter um formulário de cadastro
      const formData = navigation.formData;
      if (formData?.get("action") === "cadastrar_item") {
        setMostrarSucesso(true);
        setNovoItem({
          codigo: "",
          nome: "",
          categoria: "",
          subcategoria: "",
          detalhamento: "",
          descricao: ""
        });
        setTimeout(() => setMostrarSucesso(false), 3000);
      }
    }
  }, [isSubmitting, navigation.state, navigation.formData, abaCadastro]);

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
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setAbaCadastro(false)}
          className={`px-4 py-2 rounded-md ${!abaCadastro ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Gestão de Empréstimos
        </button>
        <button
          onClick={() => setAbaCadastro(true)}
          className={`px-4 py-2 rounded-md ${abaCadastro ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Cadastrar Item
        </button>
      </div>

      {abaCadastro ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Cadastrar Novo Item</h3>
          
          {mostrarSucesso && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-2">✅</span>
                <span className="text-green-800 font-semibold">Item cadastrado com sucesso!</span>
              </div>
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
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white`}
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Item'}
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