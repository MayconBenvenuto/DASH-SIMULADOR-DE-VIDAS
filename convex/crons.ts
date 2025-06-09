import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Atualizar dados a cada 5 minutos
crons.interval(
  "update dashboard data",
  { minutes: 5 },
  internal.dashboard.updateAllData,
  {}
);

export default crons;
