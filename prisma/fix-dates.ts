import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⏳ Scanning database for future-dated stock movements...");
  const now = new Date();

  const futureMovements = await prisma.stockMovement.findMany({
    where: {
      date: { gt: now },
    },
  });

  if (futureMovements.length === 0) {
    console.log("✅ No future-dated transactions found. Your database is healthy!");
    return;
  }

  console.log(`⚠️ Found ${futureMovements.length} future-dated transactions.`);

  const result = await prisma.stockMovement.updateMany({
    where: {
      date: { gt: now },
    },
    data: {
      date: now,
    },
  });

  console.log(`🎉 Successfully updated ${result.count} transactions to today's date!`);
}

main()
  .catch((e) => {
    console.error("❌ Error running date fix:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });