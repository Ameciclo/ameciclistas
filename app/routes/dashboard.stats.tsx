import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBikesData } from "~/api/firebaseRest.server";
// Firebase Admin SDK já importado

interface CheckIn {
  battery: number;
  ip: string;
  rssi: number;
  ssid: string;
  timestamp: number;
}

interface BikeData {
  bikes: Record<string, {
    checkins: Record<string, CheckIn>;
    sessions: Record<string, any>;
    status: any;
  }>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await getBikesData() as BikeData | null;
    
    return json({ bikes: data || {} });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return json({ bikes: {} });
  }
}

export default function StatsPage() {
  const { bikes } = useLoaderData<typeof loader>();

  // Calcular estatísticas
  const stats = Object.entries(bikes).reduce((acc, [bikeId, bike]) => {
    const checkins = Object.values(bike.checkins || {});
    const sessions = Object.values(bike.sessions || {});
    
    if (checkins.length === 0) return acc;

    const batteries = checkins.map(c => c.battery).filter(b => b > 0);
    const rssiValues = checkins.map(c => c.rssi);
    const ssids = checkins.map(c => c.ssid);
    
    const avgBattery = batteries.reduce((sum, b) => sum + b, 0) / batteries.length;
    const avgRSSI = rssiValues.reduce((sum, r) => sum + r, 0) / rssiValues.length;
    const uniqueSSIDs = [...new Set(ssids)];
    
    const lastCheckin = checkins[checkins.length - 1];
    const firstCheckin = checkins[0];
    const timeSpan = lastCheckin.timestamp - firstCheckin.timestamp;
    
    acc[bikeId] = {
      totalCheckins: checkins.length,
      totalSessions: sessions.length,
      avgBattery: Math.round(avgBattery * 100) / 100,
      avgRSSI: Math.round(avgRSSI * 100) / 100,
      uniqueNetworks: uniqueSSIDs.length,
      networks: uniqueSSIDs,
      timeSpanHours: Math.round(timeSpan / 3600 * 100) / 100,
      lastSeen: lastCheckin.timestamp,
      currentBattery: lastCheckin.battery,
      currentSSID: lastCheckin.ssid
    };
    
    return acc;
  }, {} as Record<string, any>);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  };

  const getBatteryStatus = (battery: number) => {
    if (battery > 80) return { color: 'text-green-600', status: 'Excelente' };
    if (battery > 50) return { color: 'text-yellow-600', status: 'Boa' };
    if (battery > 20) return { color: 'text-orange-600', status: 'Baixa' };
    return { color: 'text-red-600', status: 'Crítica' };
  };

  const getSignalStatus = (rssi: number) => {
    if (rssi > -50) return { color: 'text-green-600', status: 'Excelente' };
    if (rssi > -70) return { color: 'text-yellow-600', status: 'Boa' };
    return { color: 'text-red-600', status: 'Fraca' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Estatísticas das Bikes</h1>
      
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{Object.keys(bikes).length}</div>
          <div className="text-sm text-blue-800">Bikes Ativas</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(stats).reduce((sum, s) => sum + s.totalCheckins, 0)}
          </div>
          <div className="text-sm text-green-800">Total Check-ins</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Object.values(stats).reduce((sum, s) => sum + s.totalSessions, 0)}
          </div>
          <div className="text-sm text-purple-800">Total Sessões</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(Object.values(stats).reduce((sum, s) => sum + s.avgBattery, 0) / Object.keys(stats).length)}%
          </div>
          <div className="text-sm text-orange-800">Bateria Média</div>
        </div>
      </div>

      {/* Detalhes por Bike */}
      <div className="space-y-6">
        {Object.entries(stats).map(([bikeId, stat]) => {
          const batteryStatus = getBatteryStatus(stat.currentBattery);
          const signalStatus = getSignalStatus(stat.avgRSSI);
          
          return (
            <div key={bikeId} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{bikeId}</h2>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${batteryStatus.color} bg-gray-100`}>
                    🔋 {stat.currentBattery}% - {batteryStatus.status}
                  </div>
                  <div className="text-sm text-gray-600">
                    📡 {stat.currentSSID}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{stat.totalCheckins}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{stat.totalSessions}</div>
                  <div className="text-sm text-gray-600">Sessões</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-lg font-semibold ${signalStatus.color}`}>{stat.avgRSSI} dBm</div>
                  <div className="text-sm text-gray-600">RSSI Médio</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{stat.timeSpanHours}h</div>
                  <div className="text-sm text-gray-600">Período Ativo</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Redes Detectadas ({stat.uniqueNetworks})</h4>
                  <div className="flex flex-wrap gap-1">
                    {stat.networks.slice(0, 5).map((network: string) => (
                      <span key={network} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {network}
                      </span>
                    ))}
                    {stat.networks.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{stat.networks.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Última Atividade</h4>
                  <div className="text-sm text-gray-600">
                    {formatTimestamp(stat.lastSeen)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(stats).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Nenhum dado encontrado</div>
          <div className="text-gray-400 text-sm mt-2">Verifique a conexão com o Firebase</div>
        </div>
      )}
    </div>
  );
}