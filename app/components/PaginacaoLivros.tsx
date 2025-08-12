import { useState } from "react";
import type { Livro } from "~/utils/types";

interface PaginacaoLivrosProps {
  livros: Livro[];
  onSolicitar: (subcodigo: string) => void;
  userCanRequest: boolean;
}

export function PaginacaoLivros({ livros, onSolicitar, userCanRequest }: PaginacaoLivrosProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const totalPaginas = Math.ceil(livros.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const livrosPagina = livros.slice(inicio, inicio + itensPorPagina);

  const toggleExpandido = (codigo: string) => {
    setExpandidos(prev => {
      const novosExpandidos = new Set(prev);
      if (novosExpandidos.has(codigo)) {
        novosExpandidos.delete(codigo);
      } else {
        novosExpandidos.add(codigo);
      }
      return novosExpandidos;
    });
  };

  const getLivroComDisponibilidade = (livro: Livro) => ({
    ...livro,
    exemplares_disponiveis: livro.exemplares.filter(ex => ex.disponivel && !ex.consulta_local).length,
    total_exemplares: livro.exemplares.filter(ex => !ex.consulta_local).length
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => {
              setItensPorPagina(Number(e.target.value));
              setPaginaAtual(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">por página</span>
        </div>
        <span className="text-sm text-gray-600">
          {inicio + 1}-{Math.min(inicio + itensPorPagina, livros.length)} de {livros.length} livros
        </span>
      </div>

      <div className="grid gap-4 mb-6">
        {livrosPagina.map((livro) => {
          const livroInfo = getLivroComDisponibilidade(livro);
          const expandido = expandidos.has(livro.codigo);
          
          return (
            <div key={livro.codigo} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{livro.titulo}</h3>
                  <p className="text-gray-600 mb-3">
                    <strong>Disponíveis:</strong> {livroInfo.exemplares_disponiveis} de {livroInfo.total_exemplares}
                  </p>
                  
                  {expandido && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 mb-1"><strong>Autor:</strong> {livro.autor}</p>
                      <p className="text-gray-600 mb-1"><strong>Ano:</strong> {livro.ano}</p>
                      <p className="text-gray-600 mb-1"><strong>Tipo:</strong> {livro.tipo}</p>
                      <p className="text-gray-600 mb-1"><strong>Categoria:</strong> {livro.categoria}</p>
                      <p className="text-gray-600 mb-1"><strong>Código:</strong> {livro.codigo}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpandido(livro.codigo);
                    }}
                    className="text-teal-600 text-sm hover:underline mt-2 cursor-pointer"
                    type="button"
                  >
                    {expandido ? "Ver menos" : "Ver mais"}
                  </button>
                </div>
                
                <div className="ml-4">
                  {livroInfo.exemplares_disponiveis > 0 && userCanRequest && (
                    <button
                      onClick={() => {
                        const exemplaresDisponiveis = livro.exemplares.filter(ex => ex.disponivel && !ex.consulta_local);
                        if (exemplaresDisponiveis.length > 0) {
                          onSolicitar(exemplaresDisponiveis[0].subcodigo);
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Solicitar
                    </button>
                  )}
                  {livroInfo.exemplares_disponiveis === 0 && (
                    <span className="text-red-500 font-semibold">Indisponível</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setPaginaAtual(Math.max(1, paginaAtual - 1));
            }}
            disabled={paginaAtual === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
            type="button"
          >
            Anterior
          </button>
          
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            const pagina = i + Math.max(1, paginaAtual - 2);
            if (pagina > totalPaginas) return null;
            
            return (
              <button
                key={pagina}
                onClick={(e) => {
                  e.preventDefault();
                  setPaginaAtual(pagina);
                }}
                className={`px-3 py-1 border rounded cursor-pointer ${
                  pagina === paginaAtual 
                    ? 'bg-teal-600 text-white border-teal-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                type="button"
              >
                {pagina}
              </button>
            );
          })}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1));
            }}
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
            type="button"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}