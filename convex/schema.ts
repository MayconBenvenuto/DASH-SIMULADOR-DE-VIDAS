import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  dashboardData: defineTable({
    source: v.string(), // "SIMULADOR" or "INDICACAO"
    vidasTotaisVendidas: v.number(),
    valorRecebido: v.number(),
    mediaMes: v.number(),
    lastUpdated: v.number(),
  }).index("by_source", ["source"]),
};

export default defineSchema({
  ...applicationTables,
});
