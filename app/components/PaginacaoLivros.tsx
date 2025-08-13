import { useState } from "react";
import { Link } from "@remix-run/react";
import type { Livro } from "~/utils/types";

interface PaginacaoLivrosProps {
  livros: Livro[];
  onSolicitar: (subcodigo: string) => void;
  userCanRequest: boolean;
  userId?: number | string;
}

export function PaginacaoLivros({ livros, userCanRequest, userId }: PaginacaoLivrosProps) {
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
    exemplares_sede: livro.exemplares.filter(ex => ex.disponivel && ex.consulta_local).length,
    total_exemplares: livro.exemplares.filter(ex => !ex.consulta_local).length,
    apenas_sede: livro.exemplares.filter(ex => ex.disponivel && !ex.consulta_local).length === 0 && livro.exemplares.filter(ex => ex.disponivel && ex.consulta_local).length > 0
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
                  <p className="mb-3">
                    <strong>Disponíveis:</strong> 
                    <span className={`ml-1 font-semibold ${
                      livroInfo.exemplares_disponiveis === 0 && livroInfo.exemplares_sede === 0 ? 'text-red-600' :
                      livroInfo.apenas_sede ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {livroInfo.apenas_sede ? 
                        `${livroInfo.exemplares_sede} apenas para leitura na sede` :
                        livroInfo.exemplares_disponiveis === 0 && livroInfo.exemplares_sede === 0 ?
                        'Nenhum disponível' :
                        `${livroInfo.exemplares_disponiveis} de ${livroInfo.total_exemplares} para locação`
                      }
                      {livroInfo.exemplares_sede > 0 && !livroInfo.apenas_sede && (
                        <span className="text-orange-600"> + {livroInfo.exemplares_sede} na sede</span>
                      )}
                    </span>
                  </p>
                  
                  {expandido && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 mb-1"><strong>Autor:</strong> {livro.autor}</p>
                      <p className="text-gray-600 mb-1"><strong>Ano:</strong> {livro.ano}</p>
                      <p className="text-gray-600 mb-1"><strong>Tipo:</strong> {livro.tipo}</p>
                      <p className="text-gray-600 mb-1"><strong>Código:</strong> {livro.codigo}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpandido(livro.codigo);
                      }}
                      className="text-teal-600 text-sm hover:underline cursor-pointer"
                      type="button"
                    >
                      {expandido ? "Ver menos" : "Ver mais"}
                    </button>
                    {userCanRequest && livroInfo.exemplares_disponiveis >= 1 && !livroInfo.apenas_sede && (
                      <Link
                        to={`/solicitar-emprestimo?livro=${encodeURIComponent(livro.titulo)}&codigo=${livro.codigo}&userId=${userId || ''}`}
                        className="text-green-600 text-sm hover:underline cursor-pointer"
                      >
                        Solicitar empréstimo
                      </Link>
                    )}
                  </div>
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