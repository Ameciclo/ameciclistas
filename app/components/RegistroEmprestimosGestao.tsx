import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { EmprestimoInventario, SolicitacaoEmprestimoInventario, ItemInventario, UsuarioComDados } from "~/utils/types";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { formatPhone } from "~/utils/format";

interface RegistroEmprestimosGestaoProps {
  emprestimos: EmprestimoInventario[];
  solicitacoes: SolicitacaoEmprestimoInventario[];
  itens: ItemInventario[];
  users: Record<string, UsuarioComDados>;
  userPermissions: string[];
}

export function RegistroEmprestimosGestao({ emprestimos, solicitacoes, itens, users, userPermissions }: RegistroEmprestimosGestaoProps) {
  const canManage = isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS);
  const isAmecicloCoordinator = isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS);
  const [aba, setAba] = useState<'gestao' | 'itens' | 'cadastro'>('gestao');
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
  const [buscaItem, setBuscaItem] = useState("");
  const [itemEditando, setItemEditando] = useState<ItemInventario | null>(null);
  const [dadosEdicao, setDadosEdicao] = useState({
    codigo: "",
    nome: "",
    categoria: "",
    subcategoria: "",
    detalhamento: "",
    descricao: ""
  });
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("action") === "cadastrar_item";

  useEffect(() => {
    if (actionData?.success) {
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
      setItemEditando(null);
    }
  }, [actionData]);

  const iniciarEdicao = (item: ItemInventario) => {
    setItemEditando(item);
    setDadosEdicao({
      codigo: item.codigo,
      nome: item.nome,
      categoria: item.categoria,
      subcategoria: item.subcategoria || "",
      detalhamento: item.detalhamento || "",
      descricao: item.descricao || ""
    });
  };

  const itensFiltrados = itens.filter(item => {
    const termo = buscaItem.toLowerCase().trim();
    if (!termo) return true;
    return (
      item.nome.toLowerCase().includes(termo) ||
      item.codigo.toLowerCase().includes(termo) ||
      item.categoria.toLowerCase().includes(termo)
    );
  });

  const getUserName = (userId: number) => {
    const user = users[userId];
    return user?.name || user?.telegram_user?.first_name || `Usuário ${userId}`;
  };

  const getUserPhone = (userId: number) => {
    const user = users[userId];
    if (!user) return null;
    return user.ameciclo_register?.telefone
      || user.library_register?.telefone
      || user.personal?.telefone
      || null;
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
          <div className={`grid ${canManage ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
            <button
              onClick={() => setAba('gestao')}
              className={`py-2 px-3 rounded text-sm font-medium ${
                aba === 'gestao'
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Gestão de Empréstimos
            </button>
            {canManage && (
              <button
                onClick={() => setAba('itens')}
                className={`py-2 px-3 rounded text-sm font-medium ${
                  aba === 'itens'
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Itens do Inventário
              </button>
            )}
            {canManage && (
              <button
                onClick={() => setAba('cadastro')}
                className={`py-2 px-3 rounded text-sm font-medium ${
                  aba === 'cadastro'
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cadastrar Item
              </button>
            )}
          </div>
        </div>
      </div>

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

      {aba === 'cadastro' ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Cadastrar Novo Item</h3>
          
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
      ) : aba === 'itens' ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-xl font-bold">Itens do Inventário ({itens.length})</h3>
            <input
              type="text"
              placeholder="Buscar por nome, código ou categoria..."
              value={buscaItem}
              onChange={(e) => setBuscaItem(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {itemEditando && (
            <div className="border border-teal-300 rounded-lg p-4 mb-6 bg-teal-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-teal-900">Editando: {itemEditando.nome}</h4>
                <button
                  onClick={() => setItemEditando(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="action" value="editar_item" />
                <input type="hidden" name="codigo_original" value={itemEditando.codigo} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    name="codigo"
                    value={dadosEdicao.codigo}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, codigo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={dadosEdicao.nome}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    name="categoria"
                    value={dadosEdicao.categoria}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, categoria: e.target.value})}
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
                    value={dadosEdicao.subcategoria}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, subcategoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalhamento</label>
                  <textarea
                    name="detalhamento"
                    value={dadosEdicao.detalhamento}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, detalhamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    value={dadosEdicao.descricao}
                    onChange={(e) => setDadosEdicao({...dadosEdicao, descricao: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Salvar Alterações
                </button>
              </Form>
            </div>
          )}

          {itensFiltrados.length === 0 ? (
            <p className="text-gray-500">Nenhum item encontrado.</p>
          ) : (
            <div className="space-y-4">
              {itensFiltrados.map((item) => (
                <div key={item.codigo} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.nome}</p>
                      <p className="text-sm text-gray-600">Código: {item.codigo}</p>
                      <p className="text-sm text-gray-600">Categoria: {item.categoria}</p>
                      {item.subcategoria && (
                        <p className="text-sm text-gray-600">Subcategoria: {item.subcategoria}</p>
                      )}
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${item.emprestado ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className={`text-sm font-semibold ${item.emprestado ? 'text-red-600' : 'text-green-600'}`}>
                          {item.emprestado ? 'Emprestado' : 'Disponível'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => iniciarEdicao(item)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <Form method="post" className="inline" onSubmit={(e) => {
                        if (!confirm(`Tem certeza que deseja excluir o item "${item.nome}" (${item.codigo})? Esta ação não pode ser desfeita.`)) {
                          e.preventDefault();
                        }
                      }}>
                        <input type="hidden" name="action" value="excluir_item" />
                        <input type="hidden" name="codigo" value={item.codigo} />
                        <button
                          type="submit"
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Apagar
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                        {isAmecicloCoordinator && getUserPhone(solicitacao.usuario_id) && (
                          <p className="text-sm text-gray-500">
                            Telefone: {formatPhone(getUserPhone(solicitacao.usuario_id)!)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Data: {solicitacao.data_solicitacao}</p>
                      </div>
                      {canManage && (
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
                      )}
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
                        {isAmecicloCoordinator && getUserPhone(emprestimo.usuario_id) && (
                          <p className="text-sm text-gray-500">
                            Telefone: {formatPhone(getUserPhone(emprestimo.usuario_id)!)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Data de saída: {emprestimo.data_saida}</p>
                      </div>
                      {canManage && (
                        <div className="flex flex-col gap-2">
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
                          <Form method="post" className="inline" onSubmit={(e) => {
                            if (!confirm(`Tem certeza que deseja apagar este registro de empréstimo${emprestimo.status === 'emprestado' ? ' (o item será liberado)' : ''}? Esta ação não pode ser desfeita.`)) {
                              e.preventDefault();
                            }
                          }}>
                            <input type="hidden" name="action" value="excluir_emprestimo" />
                            <input type="hidden" name="emprestimo_id" value={emprestimo.id} />
                            <button
                              type="submit"
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Apagar
                            </button>
                          </Form>
                        </div>
                      )}
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