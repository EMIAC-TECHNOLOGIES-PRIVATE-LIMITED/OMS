/*
  Warnings:

  - You are about to drop the column `clientId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- DropIndex
DROP INDEX "Order_clientId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "clientId",
ADD COLUMN     "client_id" INTEGER;

-- CreateIndex
CREATE INDEX "Order_client_id_idx" ON "Order"("client_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
