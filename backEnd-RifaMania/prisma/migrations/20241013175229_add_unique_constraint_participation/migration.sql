/*
  Warnings:

  - A unique constraint covering the columns `[raffleId,number]` on the table `Participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Participation_raffleId_number_key" ON "Participation"("raffleId", "number");
