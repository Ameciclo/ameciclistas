import { Link } from "@remix-run/react";

export default function ProjetosEmAndamento() {
  const projetos = [
    { id: 1, nome: "Projeto Ciclovias Recife" },
    { id: 2, nome: "Projeto Educação para o Trânsito" },
    { id: 3, nome: "Projeto de Integração de Modais" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">🚧 Projetos em Andamento</h2>
      <div className="mt-4">
        {projetos.map((projeto) => (
          <button key={projeto.id} className="button-full">
            {projeto.nome}
          </button>
        ))}
      </div>
      <Link to="/" className="button-secondary-full">
        ⬅️ Voltar
      </Link>
    </div>
  );
}
