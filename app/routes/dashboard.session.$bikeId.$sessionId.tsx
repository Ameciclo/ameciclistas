import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getBikesData } from "~/api/firebaseRest.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { bikeId, sessionId } = params;
  const data = await getBikesData();
  
  if (!data || !data[bikeId!] || !data[bikeId!].sessions || !data[bikeId!].sessions[sessionId!]) {
    throw new Response("Sessão não encontrada", { status: 404 });
  }
  
  const session = data[bikeId!].sessions[sessionId!];
  return json({ bikeId, sessionId, session });
}

export default function SessionDetail() {
  const { bikeId, sessionId, session } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard/bikes" className="text-blue-600 hover:underline">
          ← Voltar para Bikes
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        Sessão {sessionId} - {bikeId}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold">{session.mode}</div>
            <div className="text-sm text-gray-600">Modo</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold">{session.totalScans}</div>
            <div className="text-sm text-gray-600">Total Scans</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold">{sessionId.split('_')[0]}</div>
            <div className="text-sm text-gray-600">Data</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold">
              {sessionId.split('_')[1]}
            </div>
            <div className="text-sm text-gray-600">Horário</div>
          </div>
        </div>

        <h3 className="font-semibold mb-4">Scans de Redes WiFi ({session.scans?.length || 0} scans)</h3>
        <div className="space-y-4">
          {session.scans?.map((scan: any, index: number) => {
            const prevScan = index > 0 ? session.scans[index - 1] : null;
            const timeDiff = prevScan ? scan.timestamp - prevScan.timestamp : 0;
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Scan #{index + 1}</h4>
                  <div className="text-sm text-gray-600">
                    Timestamp interno: {scan.timestamp}
                  </div>
                </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">SSID</th>
                      <th className="px-3 py-2 text-left">BSSID</th>
                      <th className="px-3 py-2 text-left">Canal</th>
                      <th className="px-3 py-2 text-left">RSSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {scan.networks?.map((network: any, netIndex: number) => (
                      <tr key={netIndex} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{network.ssid}</td>
                        <td className="px-3 py-2 text-gray-600 font-mono text-xs">{network.bssid}</td>
                        <td className="px-3 py-2 text-center">{network.channel}</td>
                        <td className={`px-3 py-2 font-medium ${
                          network.rssi > -50 ? 'text-green-600' : 
                          network.rssi > -70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {network.rssi} dBm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}