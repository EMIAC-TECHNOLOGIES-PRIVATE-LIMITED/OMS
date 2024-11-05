/*
  Warnings:

  - You are about to drop the column `tableId` on the `Resource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_description_key";

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "tableId",
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_key_key" ON "Resource"("key");
