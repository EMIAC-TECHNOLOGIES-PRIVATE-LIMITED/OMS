/*
  Warnings:

  - You are about to drop the column `columns` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Resource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[table]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[column]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `column` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Resource_key_key";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "columns",
DROP COLUMN "key",
ADD COLUMN     "column" TEXT NOT NULL,
ADD COLUMN     "table" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Resource_table_key" ON "Resource"("table");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_column_key" ON "Resource"("column");
