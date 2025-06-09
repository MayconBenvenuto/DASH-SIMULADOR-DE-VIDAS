import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-center items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Dashboard Google Sheets</h2>
      </header>
      <main className="flex-1 p-8">
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Vendas</h1>
        <button
          onClick={handleManualUpdate}
          disabled={isUpdating}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          SIMULADOR
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          INDICAÇÃO
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Status de atualização automática */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-800">
            Os dados são atualizados automaticamente a cada 5 minutos
          </span>
        </div>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{formatter(value)}</p>
    </div>
  );
}
