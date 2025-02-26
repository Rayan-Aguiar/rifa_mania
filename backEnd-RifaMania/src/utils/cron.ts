import cron from "node-cron";
import { updateRaffleStatuses } from "../functions/updateRaffleStatuses";

export const startCronJob = () => {
  try {
    cron.schedule('*/10 * * * *"', async () => {
      console.log("Executando a atualização de status...");
      await updateRaffleStatuses();
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
  }
};
