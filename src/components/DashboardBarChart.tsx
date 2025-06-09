import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DashboardBarChartProps {
  data: Array<{ name: string; vidas: number; valor: number; media: number }>;
}

export function DashboardBarChart({ data }: DashboardBarChartProps) {
  return (
    <div className="w-full h-72 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
      <h3 className="text-lg font-bold mb-2 text-primary">Comparativo de Métricas</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any, name: string) => name === 'valor' || name === 'media' ? `R$ ${value}` : value} />
          <Legend />
          <Bar dataKey="vidas" fill="#6366f1" name="Vidas Vendidas" />
          <Bar dataKey="valor" fill="#22c55e" name="Valor Recebido" />
          <Bar dataKey="media" fill="#a21caf" name="Média Mês" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
