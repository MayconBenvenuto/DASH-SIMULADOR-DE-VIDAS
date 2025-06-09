import { query, mutation, action, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// URLs das planilhas
const SHEET_URLS = {
  SIMULADOR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRstUJbWWZxp2yzQqoLZ9gFxL0hl289HwTd9jrRLxju7vyLp56-eTXn3Ja_DMW1MQ/pub?gid=1537840544&single=true&output=csv",
  INDICACAO: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRstUJbWWZxp2yzQqoLZ9gFxL0hl289HwTd9jrRLxju7vyLp56-eTXn3Ja_DMW1MQ/pub?gid=1032190707&single=true&output=csv"
};

// Query para buscar dados do dashboard
export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const simuladorData = await ctx.db
      .query("dashboardData")
      .withIndex("by_source", (q) => q.eq("source", "SIMULADOR"))
      .first();
    
    const indicacaoData = await ctx.db
      .query("dashboardData")
      .withIndex("by_source", (q) => q.eq("source", "INDICACAO"))
      .first();

    return {
      simulador: simuladorData,
      indicacao: indicacaoData,
    };
  },
});

// Mutation para salvar dados no banco
export const saveDashboardData = internalMutation({
  args: {
    source: v.string(),
    vidasTotaisVendidas: v.number(),
    valorRecebido: v.number(),
    mediaMes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dashboardData")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .first();

    const data = {
      source: args.source,
      vidasTotaisVendidas: args.vidasTotaisVendidas,
      valorRecebido: args.valorRecebido,
      mediaMes: args.mediaMes,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("dashboardData", data);
    }
  },
});

// Action para buscar dados das planilhas
export const fetchSheetData = internalAction({
  args: { source: v.string() },
  handler: async (ctx, args) => {
    const url = SHEET_URLS[args.source as keyof typeof SHEET_URLS];
    if (!url) {
      throw new Error(`Invalid source: ${args.source}`);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      
      // Procurar as linhas específicas por nome
      let vidasTotaisVendidas = 0;
      let valorRecebido = 0;
      let mediaMes = 0;

      lines.forEach(line => {
        const clean = line.replace(/"/g, '').replace(/\t/g, '').trim();
        if (clean.toLowerCase().startsWith('vidas totais vendidas')) {
          // Exemplo: Vidas Totais vendidas,,16,,,,,,
          const match = clean.match(/vidas totais vendidas.*?(\d+)/i);
          if (match) vidasTotaisVendidas = parseInt(match[1], 10);
        }
        if (clean.toLowerCase().startsWith('valor recebido')) {
          // Exemplo: Valor Recebido,,R$ 414,96,,,,,,
          const match = clean.match(/valor recebido.*?r\$\s*([\d.,]+)/i);
          if (match) valorRecebido = parseFloat(match[1].replace('.', '').replace(',', '.'));
        }
        if (clean.toLowerCase().includes('média mês')) {
          // Exemplo: Média Mês ( 8 meses ) ,,R$ 51,87,,,,,,
          const match = clean.match(/m[eé]dia m[eê]s.*?r\$\s*([\d.,]+)/i);
          if (match) mediaMes = parseFloat(match[1].replace('.', '').replace(',', '.'));
        }
      });

      // Salvar no banco de dados
      await ctx.runMutation(internal.dashboard.saveDashboardData, {
        source: args.source,
        vidasTotaisVendidas,
        valorRecebido,
        mediaMes,
      });

      return {
        vidasTotaisVendidas,
        valorRecebido,
        mediaMes,
      };
    } catch (error) {
      console.error(`Error fetching data for ${args.source}:`, error);
      throw error;
    }
  },
});

// Action para atualizar todos os dados
export const updateAllData = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    simulador: any;
    indicacao: any;
    errors: string[];
  }> => {
    const results: PromiseSettledResult<any>[] = await Promise.allSettled([
      ctx.runAction(internal.dashboard.fetchSheetData, { source: "SIMULADOR" }),
      ctx.runAction(internal.dashboard.fetchSheetData, { source: "INDICACAO" }),
    ]);

    return {
      simulador: results[0].status === "fulfilled" ? results[0].value : null,
      indicacao: results[1].status === "fulfilled" ? results[1].value : null,
      errors: results
        .filter((r: PromiseSettledResult<any>) => r.status === "rejected")
        .map((r: PromiseSettledResult<any>) => (r as PromiseRejectedResult).reason.message),
    };
  },
});

// Action pública para atualizar dados manualmente
export const manualUpdate = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    return await ctx.runAction(internal.dashboard.updateAllData, {});
  },
});
