import { Link } from "@remix-run/react";

export default function DashboardIndex() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard Firebase - Bikes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/dashboard/bikes" 
          className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-4">🚴</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Monitoramento de Bikes</h2>
              <p className="text-gray-600">Visualize dados em tempo real das bikes</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            • Check-ins e status das bikes<br />
            • Gráficos de bateria<br />
            • Histórico de sessões<br />
            • Redes WiFi detectadas
          </div>
        </Link>

        <Link 
          to="/dashboard/stats" 
          className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Estatísticas</h2>
              <p className="text-gray-600">Análise detalhada dos dados coletados</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            • Resumo geral do sistema<br />
            • Métricas por bike<br />
            • Análise de conectividade<br />
            • Histórico de atividades
          </div>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Sobre o Dashboard</h3>
        <p className="text-blue-700 text-sm">
          Este dashboard conecta-se ao Firebase Realtime Database para visualizar dados das bikes do projeto "Bota pra Rodar". 
          Os dados incluem informações de bateria, conectividade WiFi, sessões de monitoramento e localização das bikes.
        </p>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🔧 Configuração</h3>
        <p className="text-gray-600 text-sm mb-2">
          Endpoint Firebase: <code className="bg-gray-200 px-2 py-1 rounded text-xs">botaprarodar-routes-default-rtdb</code>
        </p>
        <p className="text-gray-600 text-sm">
          Certifique-se de que as credenciais do Firebase estão configuradas corretamente no arquivo <code className="bg-gray-200 px-2 py-1 rounded text-xs">.env</code>
        </p>
      </div>
    </div>
  );
}