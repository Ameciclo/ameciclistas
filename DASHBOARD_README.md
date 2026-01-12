# Dashboard Firebase - Bikes

Dashboard para visualização dos dados das bikes do projeto "Bota pra Rodar" armazenados no Firebase Realtime Database.

## 🚀 Funcionalidades

### 📊 **Monitoramento de Bikes**
- Visualização em tempo real dos dados das bikes
- Gráficos de evolução da bateria
- Histórico de check-ins
- Status de conectividade (RSSI, SSID, IP)
- Informações de sessões de monitoramento

### 📈 **Estatísticas**
- Resumo geral do sistema
- Métricas detalhadas por bike
- Análise de conectividade
- Histórico de atividades
- Redes WiFi detectadas

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.dashboard.example` para `.env` e configure:

```bash
cp .env.dashboard.example .env
```

Configure as seguintes variáveis:

```env
DASHBOARD_FIREBASE_API_KEY=AIzaSyBOf0iB1PE3byamxPaPnxRdjZHT-Wx5mKs
DASHBOARD_FIREBASE_DATABASE_URL=https://botaprarodar-routes-default-rtdb.firebaseio.com
DASHBOARD_FIREBASE_PROJECT_ID=botaprarodar-routes
```

### 2. Estrutura dos Dados

O dashboard espera a seguinte estrutura no Firebase:

```json
{
  "bikes": {
    "bikeId": {
      "checkins": {
        "timestamp": {
          "battery": 84.1,
          "ip": "192.168.10.108",
          "rssi": -43,
          "ssid": "Ameciclo",
          "timestamp": 1760376438
        }
      },
      "sessions": {
        "sessionId": {
          "end": 13467,
          "mode": "normal",
          "scans": [...],
          "start": 13467,
          "totalScans": 1
        }
      },
      "status": {
        "bike": "bikeId",
        "connections": [...],
        "lastUpdate": 1762021281
      }
    }
  }
}
```

## 🌐 Rotas

- `/dashboard` - Página inicial com navegação
- `/dashboard/bikes` - Monitoramento detalhado das bikes
- `/dashboard/stats` - Estatísticas e análises

## 📱 Interface

### Página de Bikes
- **Header**: Nome da bike, bateria atual, sinal WiFi
- **Status**: Última atualização, conexões, total de check-ins
- **Gráfico**: Evolução da bateria ao longo do tempo
- **Tabela**: Últimos 10 check-ins com detalhes
- **Sessões**: Cards com informações das sessões recentes

### Página de Estatísticas
- **Resumo**: Cards com totais gerais
- **Detalhes por Bike**: Métricas individuais
- **Redes**: WiFi networks detectadas
- **Atividade**: Período ativo e última atividade

## 🎨 Componentes

### BatteryChart
Gráfico SVG que mostra a evolução da bateria:
- Últimos 20 pontos de dados
- Cores baseadas no nível da bateria
- Grid com percentuais
- Tooltips com informações detalhadas

## 🔍 Indicadores Visuais

### Bateria
- 🟢 Verde: > 80%
- 🟡 Amarelo: 50-80%
- 🟠 Laranja: 20-50%
- 🔴 Vermelho: < 20%

### Sinal WiFi (RSSI)
- 🟢 Verde: > -50 dBm (Excelente)
- 🟡 Amarelo: -50 a -70 dBm (Boa)
- 🔴 Vermelho: < -70 dBm (Fraca)

## 🚀 Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar o dashboard
http://localhost:3000/dashboard
```

## 📊 Dados de Exemplo

O dashboard foi testado com dados reais do Firebase contendo:
- 2 bikes: `diadaRO` e `indoproca`
- Múltiplos check-ins com dados de bateria e conectividade
- Sessões de monitoramento com scans de redes WiFi
- Status de conexão e última atualização

## 🔒 Segurança

- Configure regras de segurança no Firebase
- Use variáveis de ambiente para credenciais
- Considere implementar autenticação para produção

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique as credenciais do Firebase
- Confirme se o Realtime Database está ativo
- Teste a URL do database

### Dados Não Aparecem
- Verifique a estrutura dos dados no Firebase
- Confirme se há dados na coleção `bikes`
- Verifique o console do navegador para erros

### Performance
- O dashboard carrega todos os dados por padrão
- Para grandes volumes, considere implementar paginação
- Use índices no Firebase para consultas otimizadas

## 📝 Próximas Funcionalidades

- [ ] Filtros por período
- [ ] Exportação de dados
- [ ] Alertas de bateria baixa
- [ ] Mapa com localização das bikes
- [ ] Notificações em tempo real
- [ ] Relatórios automáticos