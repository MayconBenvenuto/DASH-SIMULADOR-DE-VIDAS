// Componentes de visualização de métricas para dashboard
// Diretório: src/components/dashboardMetrics
//
// Este arquivo exporta um componente principal <DashboardMetrics /> e componentes auxiliares para visualização de métricas.
// Utiliza Recharts para gráficos, Tailwind para estilização, clsx/tailwind-merge para classes dinâmicas e integração real/mocks com Convex API.

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

// Tipos para métricas
export interface MetricData {
  date: string;
  novasVidas: number;
  receita: number;
  ticketMedio: number;
  comissao: number;
  retencao: number;
  categoria?: string;
}

// Mock data para desenvolvimento
const mockMetrics: MetricData[] = [
  { date: "2025-06-01", novasVidas: 10, receita: 1000, ticketMedio: 100, comissao: 120, retencao: 95, categoria: "Produto A" },
  { date: "2025-06-02", novasVidas: 8, receita: 900, ticketMedio: 112, comissao: 110, retencao: 94, categoria: "Produto B" },
  { date: "2025-06-03", novasVidas: 12, receita: 1300, ticketMedio: 108, comissao: 140, retencao: 96, categoria: "Produto A" },
  { date: "2025-06-04", novasVidas: 7, receita: 800, ticketMedio: 114, comissao: 100, retencao: 93, categoria: "Produto B" },
  // ...adicione mais para simular períodos maiores
];

// Filtros disponíveis
const periodOptions = [
  { label: "Diário", value: "day" },
  { label: "Semanal", value: "week" },
  { label: "Mensal", value: "month" },
  { label: "Custom", value: "custom" },
];

const categoryOptions = [
  { label: "Todos", value: "all" },
  { label: "Produto A", value: "Produto A" },
  { label: "Produto B", value: "Produto B" },
];

// Função de fetch real (exemplo, ajuste conforme sua API Convex)
async function fetchMetrics({ period, category }: { period: string; category: string }) {
  try {
    // Exemplo de chamada real (ajuste para sua API):
    // const data = await api.metrics.getMetrics({ period, category });
    // return data;
    // Por enquanto, retorna mock
    return mockMetrics;
  } catch (error: any) {
    toast.error("Erro ao buscar métricas: " + (error?.message || "Erro desconhecido"));
    return [];
  }
}

// Componente principal
export function DashboardMetrics() {
  const { isAuthenticated } = useConvexAuth();
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState("all");
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch automático e periódico
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMetrics({ period, category }).then((data) => {
      if (mounted) setMetrics(data);
      setLoading(false);
    });
    const interval = setInterval(() => {
      fetchMetrics({ period, category }).then((data) => {
        if (mounted) setMetrics(data);
      });
    }, 60_000); // 1 min
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [period, category]);

  if (!isAuthenticated) {
    return <div className="text-center text-gray-500 py-8">Faça login para visualizar as métricas.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex gap-2">
          <Select value={period} onChange={setPeriod} options={periodOptions} label="Período" />
          <Select value={category} onChange={setCategory} options={categoryOptions} label="Categoria" />
        </div>
        {loading && (
          <div className="flex items-center gap-2 animate-pulse text-primary">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Carregando métricas...
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <MetricCard title="Novas vidas vendidas" value={sum(metrics, "novasVidas")} icon="👥" color="from-blue-400 to-blue-600" />
        <MetricCard title="Receita acumulada" value={sum(metrics, "receita")} icon="💰" color="from-green-400 to-green-600" formatter={formatCurrency} />
        <MetricCard title="Ticket médio" value={avg(metrics, "ticketMedio")} icon="📊" color="from-purple-400 to-purple-600" formatter={formatCurrency} />
        <MetricCard title="Comissões pagas" value={sum(metrics, "comissao")} icon="🏆" color="from-yellow-400 to-yellow-600" formatter={formatCurrency} />
        <MetricCard title="Taxa de retenção" value={avg(metrics, "retencao")} icon="🔄" color="from-pink-400 to-pink-600" formatter={v => v.toFixed(1) + "%"} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MetricsLineChart data={metrics} />
        <MetricsBarChart data={metrics} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ComissaoPieChart data={metrics} />
        {/* Adicione outros gráficos conforme necessário */}
      </div>
    </div>
  );
}

// Componente de seleção
function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; label: string }) {
  return (
    <label className="flex flex-col text-sm font-medium text-gray-700">
      {label}
      <select
        className="mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white shadow-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

// Card de métrica
function MetricCard({ title, value, icon, color, formatter }: { title: string; value: number; icon: string; color: string; formatter?: (v: number) => string }) {
  return (
    <div className={cn("relative bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center group hover:scale-105 transition-transform duration-200 border-t-4 border-transparent hover:border-primary min-h-[170px]", "")}>      <div className={`absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-base font-semibold text-gray-700 mt-12 mb-2 text-center">{title}</h3>
      <p className="text-3xl font-extrabold text-gray-900 mb-1 text-center">{formatter ? formatter(value) : value}</p>
    </div>
  );
}

// Gráfico de linha para evolução de vidas e receita
function MetricsLineChart({ data }: { data: MetricData[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h4 className="font-bold mb-2">Evolução de Vidas e Receita</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="novasVidas" stroke="#2563eb" name="Novas Vidas" />
          <Line type="monotone" dataKey="receita" stroke="#22c55e" name="Receita" yAxisId={1} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de barras para ticket médio e retenção
function MetricsBarChart({ data }: { data: MetricData[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h4 className="font-bold mb-2">Ticket Médio e Retenção</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="ticketMedio" fill="#a21caf" name="Ticket Médio" />
          <Bar dataKey="retencao" fill="#f472b6" name="Retenção (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de pizza para comissões por categoria
function ComissaoPieChart({ data }: { data: MetricData[] }) {
  // Agrupa por categoria
  const categorias = Array.from(new Set(data.map(d => d.categoria || "Outro")));
  const dataPie = categorias.map(cat => ({
    name: cat,
    value: data.filter(d => (d.categoria || "Outro") === cat).reduce((acc, cur) => acc + cur.comissao, 0),
  }));
  const COLORS = ["#2563eb", "#f59e42", "#22c55e", "#a21caf", "#f472b6", "#facc15"];
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h4 className="font-bold mb-2">Comissões por Categoria</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {dataPie.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Tooltip customizada
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow text-xs text-gray-800 border border-gray-200">
        <div className="font-bold mb-1">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }}></span>
            <span>{p.name}:</span>
            <span className="font-semibold">{typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Helpers
function sum(arr: MetricData[], key: keyof MetricData) {
  return arr.reduce((acc, cur) => acc + (cur[key] as number), 0);
}
function avg(arr: MetricData[], key: keyof MetricData) {
  if (!arr.length) return 0;
  return sum(arr, key) / arr.length;
}
function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Export default para facilitar importação
export default DashboardMetrics;

// Comentários explicativos e instruções de uso estão no README abaixo.
