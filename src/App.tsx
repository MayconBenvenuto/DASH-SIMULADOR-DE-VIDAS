import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { useState } from "react";
import { DashboardBarChart } from "./components/DashboardBarChart";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-cyan-50 to-white">
      <header className="sticky top-0 z-10 bg-[#011147] h-20 flex justify-center items-center border-b shadow-md px-4">
        <div className="flex items-center gap-3 w-full max-w-5xl justify-center relative">
          <img src="/assets/logo-belz.jpg" alt="Logo Belz" className="h-12 w-12 object-contain rounded bg-white p-1 absolute left-0" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm flex items-center gap-2 mx-auto">
            Dashboard Vida+Saúde
          </h2>
        </div>
      </header>
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Dashboard />
      </main>
      <Toaster />
    </div>
  );
}

function Dashboard() {
  const dashboardData = useQuery(api.dashboard.getDashboardData);
  const updateAllData = useAction(api.dashboard.manualUpdate);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateAllData();
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Observações dinâmicas
  const obsSimulador = [];
  const vidasSim = dashboardData.simulador?.vidasTotaisVendidas ?? 0;
  const mediaSim = dashboardData.simulador?.mediaMes ?? 0;
  if (vidasSim > 100) {
    obsSimulador.push("Ótimo desempenho em vidas vendidas no Simulador!");
  } else if (vidasSim > 0) {
    obsSimulador.push("Há potencial para aumentar as vendas no Simulador.");
  } else {
    obsSimulador.push("Nenhuma venda registrada no Simulador.");
  }
  if (mediaSim > 1000) {
    obsSimulador.push("A média mensal está acima de R$ 1.000, excelente!");
  }

  const obsIndicacao = [];
  const vidasInd = dashboardData.indicacao?.vidasTotaisVendidas ?? 0;
  const mediaInd = dashboardData.indicacao?.mediaMes ?? 0;
  if (vidasInd > 100) {
    obsIndicacao.push("Ótimo desempenho em vidas vendidas por Indicação!");
  } else if (vidasInd > 0) {
    obsIndicacao.push("Há potencial para aumentar as vendas por Indicação.");
  } else {
    obsIndicacao.push("Nenhuma venda registrada por Indicação.");
  }
  if (mediaInd > 1000) {
    obsIndicacao.push("A média mensal está acima de R$ 1.000, excelente!");
  }

  // Dados para o gráfico
  const chartData = [
    {
      name: "Simulador",
      vidas: dashboardData.simulador?.vidasTotaisVendidas || 0,
      valor: dashboardData.simulador?.valorRecebido || 0,
      media: dashboardData.simulador?.mediaMes || 0,
    },
    {
      name: "Indicação",
      vidas: dashboardData.indicacao?.vidasTotaisVendidas || 0,
      valor: dashboardData.indicacao?.valorRecebido || 0,
      media: dashboardData.indicacao?.mediaMes || 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 section-title">Relatório de Vendas</h1>
        <button
          onClick={() => { void handleManualUpdate(); }}
          disabled={isUpdating}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Atualizando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Dados
            </>
          )}
        </button>
      </div>

      {/* SIMULADOR Section */}
      <div className="space-y-4">
        <h2 className="section-title">
          <div className="w-4 h-4 bg-blue-500 rounded-full shadow"></div>
          SIMULADOR
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard
            title="Vidas Totais Vendidas"
            value={dashboardData.simulador?.vidasTotaisVendidas || 0}
            formatter={formatNumber}
            icon="👥"
            color="bg-blue-500"
          />
          <MetricCard
            title="Valor Recebido"
            value={dashboardData.simulador?.valorRecebido || 0}
            formatter={formatCurrency}
            icon="💰"
            color="bg-green-500"
          />
          <MetricCard
            title="Média Mês (8 meses)"
            value={dashboardData.simulador?.mediaMes || 0}
            formatter={formatCurrency}
            icon="📊"
            color="bg-purple-500"
          />
        </div>
        {dashboardData.simulador?.lastUpdated && (
          <p className="text-sm text-gray-500">
            Última atualização: {formatDate(dashboardData.simulador.lastUpdated)}
          </p>
        )}
      </div>

      {/* INDICACAO Section */}
      <div className="space-y-4">
        <h2 className="section-title">
          <div className="w-4 h-4 bg-orange-500 rounded-full shadow"></div>
          INDICAÇÃO
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard
            title="Vidas Totais Vendidas"
            value={dashboardData.indicacao?.vidasTotaisVendidas || 0}
            formatter={formatNumber}
            icon="👥"
            color="bg-blue-500"
          />
          <MetricCard
            title="Valor Recebido"
            value={dashboardData.indicacao?.valorRecebido || 0}
            formatter={formatCurrency}
            icon="💰"
            color="bg-green-500"
          />
          <MetricCard
            title="Média Mês (8 meses)"
            value={dashboardData.indicacao?.mediaMes || 0}
            formatter={formatCurrency}
            icon="📊"
            color="bg-purple-500"
          />
        </div>
        {dashboardData.indicacao?.lastUpdated && (
          <p className="text-sm text-gray-500">
            Última atualização: {formatDate(dashboardData.indicacao.lastUpdated)}
          </p>
        )}
      </div>

      {/* Gráfico de Barras Comparativo */}
      <DashboardBarChart data={chartData} />

      {/* Observações dinâmicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Observações Simulador</h4>
          <ul className="list-disc ml-5 text-gray-700">
            {obsSimulador.map((obs, i) => <li key={i}>{obs}</li>)}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Observações Indicação</h4>
          <ul className="list-disc ml-5 text-gray-700">
            {obsIndicacao.map((obs, i) => <li key={i}>{obs}</li>)}
          </ul>
        </div>
      </div>

      {/* Status de atualização automática */}
      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-white border border-blue-200 rounded-2xl p-4 shadow flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-blue-800 font-medium">
          Os dados são atualizados automaticamente a cada 5 minutos
        </span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  formatter: (value: number) => string;
  icon: string;
  color: string;
}

function MetricCard({ title, value, formatter, icon, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-600 mb-2 tracking-tight">{title}</h3>
      <p className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">{formatter(value)}</p>
    </div>
  );
}
