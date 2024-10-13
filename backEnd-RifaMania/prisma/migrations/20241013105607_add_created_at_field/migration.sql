-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Raffle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "drawDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "drawType" TEXT NOT NULL,
    "ticketPrice" REAL NOT NULL DEFAULT 0,
    "availableNumbersCount" INTEGER NOT NULL DEFAULT 0,
    "totalNumbers" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT NOT NULL,
    "uniqueLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Raffle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Raffle" ("availableNumbersCount", "closed", "creatorId", "drawDate", "drawType", "id", "name", "status", "ticketPrice", "totalNumbers", "uniqueLink") SELECT "availableNumbersCount", "closed", "creatorId", "drawDate", "drawType", "id", "name", "status", "ticketPrice", "totalNumbers", "uniqueLink" FROM "Raffle";
DROP TABLE "Raffle";
ALTER TABLE "new_Raffle" RENAME TO "Raffle";
CREATE UNIQUE INDEX "Raffle_uniqueLink_key" ON "Raffle"("uniqueLink");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
