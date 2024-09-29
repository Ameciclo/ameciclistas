import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-teal-600">Ameciclobot Miniapp</h1>
      <div className="mt-6 flex space-x-4">
        <Link to="/solicitar-pagamento">
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/criar-evento">
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            📅 Criar Evento
          </button>
        </Link>
      </div>
    </div>
  );
}
