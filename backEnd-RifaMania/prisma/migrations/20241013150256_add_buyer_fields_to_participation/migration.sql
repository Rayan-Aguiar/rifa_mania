/*
  Warnings:

  - Added the required column `buyerEmail` to the `Participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerName` to the `Participation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerPhone` to the `Participation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participation_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Participation" ("createdAt", "id", "number", "raffleId", "status", "updatedAt", "userId") SELECT "createdAt", "id", "number", "raffleId", "status", "updatedAt", "userId" FROM "Participation";
DROP TABLE "Participation";
ALTER TABLE "new_Participation" RENAME TO "Participation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
