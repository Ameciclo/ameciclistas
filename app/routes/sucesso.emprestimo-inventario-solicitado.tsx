import { Link } from "@remix-run/react";

export default function SucessoEmprestimoInventarioSolicitado() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          Solicitação Enviada com Sucesso!
        </h1>
        <p className="text-green-700 mb-6">
          Sua solicitação de empréstimo foi registrada e será analisada por um coordenador de projeto.
          Você será notificado sobre o status da sua solicitação.
        </p>
        <div className="space-y-3">
          <Link 
            to="/registro-emprestimos" 
            className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline"
          >
            Voltar ao Registro de Empréstimos
          </Link>
          <Link 
            to="/" 
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors block text-center no-underline"
          >
            Voltar ao Menu Principal
          </Link>
        </div>
      </div>
    </div>
  );
}