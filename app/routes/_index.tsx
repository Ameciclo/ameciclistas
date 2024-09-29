import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">Ameciclobot Miniapp</h1>
      <div className="mt-6">
        <Link to="/criar-evento">
          <button className="button-full">
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button className="button-full">
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button className="button-full">
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button className="button-full">
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button className="button-full">
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button className="button-full">
            📊 Projetos em Andamento
          </button>
        </Link>
      </div>
    </div>
  );
}