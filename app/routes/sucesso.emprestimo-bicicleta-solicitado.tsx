import { Link } from "@remix-run/react";

export default function SucessoEmprestimoBicicletaSolicitado() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Solicitação Enviada!
          </h1>
          <p className="text-gray-600">
            Sua solicitação de empréstimo de bicicleta foi enviada com sucesso.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Próximos Passos:</h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• Aguarde a aprovação da coordenação</li>
            <li>• Você será notificado quando aprovado</li>
            <li>• Retire a bicicleta na sede da Ameciclo</li>
            <li>• Lembre-se do prazo de devolução</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            to="/bota-pra-rodar" 
            className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline"
          >
            🚴 Voltar para Bota pra Rodar
          </Link>
          
          <Link 
            to="/" 
            className="button-secondary-full text-center"
          >
            🏠 Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}