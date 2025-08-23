import { useState } from "react";
import { Link } from "@remix-run/react";
import type { ItemInventario } from "~/utils/types";

interface PaginacaoInventarioProps {
  itens: ItemInventario[];
  onSolicitar: (codigo: string) => void;
  userCanRequest: boolean;
  userId?: number;
}

export function PaginacaoInventario({ itens, onSolicitar, userCanRequest, userId }: PaginacaoInventarioProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 12;
  
  const totalPaginas = Math.ceil(itens.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const itensPagina = itens.slice(indiceInicial, indiceInicial + itensPorPagina);

  const handleSolicitar = (codigo: string) => {
    if (!userId) {
      alert("Você precisa estar logado para solicitar um item");
      return;
    }
    onSolicitar(codigo);
  };

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {itensPagina.length} de {itens.length} itens
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {itensPagina.map((item) => (
          <div key={item.codigo} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.nome}</h3>
              <p className="text-gray-600 mb-1">
                <strong>Código:</strong> {item.codigo}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Categoria:</strong> {item.categoria}
              </p>
              {item.subcategoria && (
                <p className="text-gray-600 mb-1">
                  <strong>Subcategoria:</strong> {item.subcategoria}
                </p>
              )}
              {item.detalhamento && (
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Detalhamento:</strong> {item.detalhamento}
                </p>
              )}
              {item.descricao && (
                <p className="text-gray-600 text-sm mt-2">{item.descricao}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {item.disponivel ? (
                <div>
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-600 font-semibold">Disponível</span>
                  </div>
                  {userCanRequest && (
                    <Link
                      to={`/solicitar-emprestimo-inventario?codigo=${item.codigo}`}
                      className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline"
                    >
                      Solicitar Empréstimo
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-600 font-semibold">Emprestado</span>
                  </div>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                  >
                    Indisponível
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
            <button
              key={pagina}
              onClick={() => setPaginaAtual(pagina)}
              className={`px-3 py-2 rounded-md ${
                pagina === paginaAtual
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pagina}
            </button>
          ))}
          
          <button
            onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}