import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getBikesData } from "~/api/firebaseRest.server";
// Firebase Admin SDK já importado
import BatteryChart from "~/components/BatteryChart";

interface CheckIn {
  battery: number;
  ip: string;
  rssi: number;
  ssid: string;
  timestamp: number;
}

interface Network {
  bssid: string;
  channel: number;
  rssi: number;
  ssid: string;
}

interface Scan {
  networks: Network[];
  realTime: number;
  timestamp: number;
}

interface Session {
  end: number;
  mode: string;
  scans: Scan[];
  start: number;
  totalScans: number;
}

interface Connection {
  base: string;
  event: string;
  ip: string;
  time: number;
}

interface BikeStatus {
  bike: string;
  connections: Connection[];
  lastUpdate: number;
}

interface Bike {
  checkins: Record<string, CheckIn>;
  sessions: Record<string, Session>;
  status: BikeStatus;
}

interface BikeData {
  bikes: Record<string, Bike>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await getBikesData() as BikeData | null;
    
    console.log('Dados processados:', data);
    return json({ bikes: data || {} });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return json({ bikes: {} });
  }
}

export default function BikesDashboard() {
  const { bikes } = useLoaderData<typeof loader>();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 80) return 'text-green-600';
    if (battery > 50) return 'text-yellow-600';
    if (battery > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRSSIColor = (rssi: number) => {
    if (rssi > -50) return 'text-green-600';
    if (rssi > -70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard - Bikes</h1>
      
      {Object.entries(bikes).map(([bikeId, bike]) => {
        const checkins = Object.entries(bike.checkins || {});
        const sessions = Object.entries(bike.sessions || {});
        const lastCheckin = checkins[checkins.length - 1]?.[1];
        
        return (
          <div key={bikeId} className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{bikeId}</h2>
              <div className="flex items-center space-x-4">
                {lastCheckin && (
                  <>
                    <div className={`font-semibold ${getBatteryColor(lastCheckin.battery)}`}>
                      🔋 {lastCheckin.battery}%
                    </div>
                    <div className={`font-semibold ${getRSSIColor(lastCheckin.rssi)}`}>
                      📶 {lastCheckin.rssi} dBm
                    </div>
                    <div className="text-sm text-gray-600">
                      📡 {lastCheckin.ssid}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            {bike.status && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Última atualização:</span><br />
                    {formatTimestamp(bike.status.lastUpdate)}
                  </div>
                  <div>
                    <span className="font-medium">Conexões:</span><br />
                    {bike.status.connections?.length || 0} registradas
                  </div>
                  <div>
                    <span className="font-medium">Check-ins:</span><br />
                    {checkins.length} registros
                  </div>
                </div>
              </div>
            )}

            {/* Gráfico de Bateria */}
            {checkins.length > 0 && (
              <div className="mb-6">
                <BatteryChart checkins={bike.checkins} bikeId={bikeId} />
              </div>
            )}

            {/* Últimos Check-ins */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Últimos Check-ins</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bateria</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RSSI</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SSID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {checkins.slice(-10).reverse().map(([timestamp, checkin]) => (
                      <tr key={timestamp} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatTimestamp(checkin.timestamp)}
                        </td>
                        <td className={`px-4 py-2 text-sm font-medium ${getBatteryColor(checkin.battery)}`}>
                          {checkin.battery}%
                        </td>
                        <td className={`px-4 py-2 text-sm font-medium ${getRSSIColor(checkin.rssi)}`}>
                          {checkin.rssi} dBm
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{checkin.ssid}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{checkin.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sessões */}
            <div>
              <h3 className="font-semibold mb-3">Sessões Recentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.slice(-6).map(([sessionId, session]) => (
                  <Link 
                    key={sessionId} 
                    to={`/dashboard/session/${bikeId}/${sessionId}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm mb-2">{sessionId}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Modo: <span className="font-medium">{session.mode}</span></div>
                      <div>Scans: <span className="font-medium">{session.totalScans}</span></div>
                      <div>Duração: <span className="font-medium">{session.end - session.start}s</span></div>
                      <div>Redes detectadas: <span className="font-medium">
                        {session.scans?.[0]?.networks?.length || 0}
                      </span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {Object.keys(bikes).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Nenhuma bike encontrada</div>
          <div className="text-gray-400 text-sm mt-2">Verifique a conexão com o Firebase</div>
        </div>
      )}
    </div>
  );
}