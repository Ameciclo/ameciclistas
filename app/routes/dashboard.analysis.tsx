import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBikesData } from "~/api/firebaseRest.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await getBikesData();
  
  if (!data) return json({ analysis: null });

  const analysis = Object.entries(data).map(([bikeId, bike]) => {
    const sessions = Object.entries(bike.sessions || {}).map(([sessionId, session]) => {
      const scans = session.scans || [];
      const realTimeNonZero = scans.filter(scan => scan.realTime !== 0);
      const allRealTimeNonZero = scans.length > 0 && scans.every(scan => scan.realTime !== 0);
      
      return {
        sessionId,
        totalScans: scans.length,
        realTimeNonZeroCount: realTimeNonZero.length,
        allRealTimeNonZero,
        realTimeValues: scans.map(scan => scan.realTime),
        mode: session.mode
      };
    });

    return {
      bikeId,
      sessions
    };
  });

  return json({ analysis });
}

export default function AnalysisPage() {
  const { analysis } = useLoaderData<typeof loader>();

  if (!analysis) {
    return <div className="p-6">Nenhum dado encontrado</div>;
  }

  const totalSessions = analysis.reduce((sum, bike) => sum + bike.sessions.length, 0);
  const sessionsWithNonZeroRealTime = analysis.reduce((sum, bike) => 
    sum + bike.sessions.filter(s => s.realTimeNonZeroCount > 0).length, 0
  );
  const sessionsWithAllNonZeroRealTime = analysis.reduce((sum, bike) => 
    sum + bike.sessions.filter(s => s.allRealTimeNonZero).length, 0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Análise de RealTime</h1>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
          <div className="text-sm text-blue-800">Total de Sessões</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{sessionsWithNonZeroRealTime}</div>
          <div className="text-sm text-green-800">Com RealTime ≠ 0</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{sessionsWithAllNonZeroRealTime}</div>
          <div className="text-sm text-purple-800">Todos RealTime ≠ 0</div>
        </div>
      </div>

      {/* Detalhes por Bike */}
      {analysis.map(bike => (
        <div key={bike.bikeId} className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{bike.bikeId}</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Sessão</th>
                  <th className="px-3 py-2 text-left">Modo</th>
                  <th className="px-3 py-2 text-left">Total Scans</th>
                  <th className="px-3 py-2 text-left">RealTime ≠ 0</th>
                  <th className="px-3 py-2 text-left">Todos ≠ 0?</th>
                  <th className="px-3 py-2 text-left">Valores RealTime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bike.sessions.map(session => (
                  <tr key={session.sessionId} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{session.sessionId}</td>
                    <td className="px-3 py-2">{session.mode}</td>
                    <td className="px-3 py-2 text-center">{session.totalScans}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={session.realTimeNonZeroCount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {session.realTimeNonZeroCount}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.allRealTimeNonZero 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {session.allRealTimeNonZero ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {session.realTimeValues.slice(0, 5).join(', ')}
                      {session.realTimeValues.length > 5 && '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}