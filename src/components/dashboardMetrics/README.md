# DashboardMetrics - Componentes de Visualização de Métricas

## Como integrar e usar

1. Instale o Recharts:
   ```bash
   npm install recharts
   ```
2. Importe e use o componente principal:
   ```tsx
   import DashboardMetrics from "@/components/dashboardMetrics/DashboardMetrics";
   // ...
   <DashboardMetrics />
   ```
3. O componente já faz fetch automático (mock ou real) e é responsivo.

## Como alterar as métricas monitoradas
- Para adicionar/remover métricas, edite o array de mock ou a função de fetch.
- Para adicionar um novo gráfico, crie um novo componente e inclua no layout.
- Para alterar filtros, edite os arrays `periodOptions` e `categoryOptions`.

## Recomendações UX/UI para dashboards
- Use cores consistentes para cada métrica (ex: azul para "vidas", verde para "receita").
- Prefira gráficos de linha para evolução temporal e pizza para proporções.
- Sempre use tooltips detalhados e responsivos.
- Cards de métrica devem ser grandes, legíveis e com ícones.
- Garanta contraste e responsividade (testado em mobile e desktop).
- Use animações suaves para loading e interação.

## Boas práticas
- Código modular, separado por arquivos.
- Use ESLint/Prettier para manter o padrão.
- Utilize o mock para desenvolvimento e troque para fetch real ao integrar com a API.

---

### Exemplo de fetch real (Convex):
```ts
async function fetchMetrics({ period, category }: { period: string; category: string }) {
  try {
    // Ajuste para sua API Convex
    const data = await api.metrics.getMetrics({ period, category });
    return data;
  } catch (error: any) {
    toast.error("Erro ao buscar métricas: " + (error?.message || "Erro desconhecido"));
    return [];
  }
}
```

---

Sinta-se à vontade para customizar os componentes conforme a identidade visual do seu projeto!
