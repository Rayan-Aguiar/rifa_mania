/*
  Warnings:

  - You are about to drop the column `userId` on the `Participation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raffleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participation_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Participation" ("buyerEmail", "buyerName", "buyerPhone", "createdAt", "id", "number", "raffleId", "status", "updatedAt") SELECT "buyerEmail", "buyerName", "buyerPhone", "createdAt", "id", "number", "raffleId", "status", "updatedAt" FROM "Participation";
DROP TABLE "Participation";
ALTER TABLE "new_Participation" RENAME TO "Participation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
