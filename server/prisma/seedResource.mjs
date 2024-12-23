import { PrismaClient } from '@prisma/client';
import tableDataTypes from "./tableDataTypes.mjs";

const prisma = new PrismaClient();

async function main() {
  for (const [table, columns] of Object.entries(tableDataTypes)) {
    const lowerCaseTable = table.toLowerCase();

    for (const column of Object.keys(columns)) {
      try {
        await prisma.resource.create({
          data: {
            table: lowerCaseTable,
            column: column,
            description: `Field ${column} in table ${lowerCaseTable}`,
          },
        });
        console.log(`Inserted Resource: ${lowerCaseTable} - ${column}`);
      } catch (error) {
        console.error(`Error inserting Resource for ${lowerCaseTable} - ${column}:`, error);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
