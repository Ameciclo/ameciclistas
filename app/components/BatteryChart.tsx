interface CheckIn {
  battery: number;
  timestamp: number;
  ssid: string;
}

interface BatteryChartProps {
  checkins: Record<string, CheckIn>;
  bikeId: string;
}

export default function BatteryChart({ checkins, bikeId }: BatteryChartProps) {
  const data = Object.entries(checkins)
    .map(([_, checkin]) => ({
      time: new Date(checkin.timestamp * 1000).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      battery: checkin.battery,
      timestamp: checkin.timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-20); // Últimos 20 pontos

  if (data.length === 0) return null;

  const maxBattery = Math.max(...data.map(d => d.battery));
  const minBattery = Math.min(...data.map(d => d.battery));
  const range = maxBattery - minBattery || 1;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-semibold mb-4">Evolução da Bateria - {bikeId}</h4>
      <div className="relative h-48 w-full">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = 180 - (value / 100) * 160;
            return (
              <g key={value}>
                <line
                  x1="40"
                  y1={y}
                  x2="380"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y={y + 4}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          {/* Line chart */}
          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={data.map((point, index) => {
                const x = 40 + (index / (data.length - 1)) * 340;
                const y = 180 - ((point.battery - minBattery) / range) * 160;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}

          {/* Data points */}
          {data.map((point, index) => {
            const x = 40 + (index / (data.length - 1)) * 340;
            const y = 180 - ((point.battery - minBattery) / range) * 160;
            const color = point.battery > 80 ? '#10b981' : 
                         point.battery > 50 ? '#f59e0b' : 
                         point.battery > 20 ? '#f97316' : '#ef4444';
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                />
                <title>{`${point.time}: ${point.battery}%`}</title>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((point, index) => {
            const originalIndex = data.findIndex(d => d.timestamp === point.timestamp);
            const x = 40 + (originalIndex / (data.length - 1)) * 340;
            return (
              <text
                key={index}
                x={x}
                y="195"
                fontSize="9"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.time}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}