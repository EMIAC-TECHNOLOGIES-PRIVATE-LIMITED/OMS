/*
  Warnings:

  - A unique constraint covering the columns `[table,column]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Resource_column_key";

-- DropIndex
DROP INDEX "Resource_table_key";

-- CreateIndex
CREATE UNIQUE INDEX "Resource_table_column_key" ON "Resource"("table", "column");
