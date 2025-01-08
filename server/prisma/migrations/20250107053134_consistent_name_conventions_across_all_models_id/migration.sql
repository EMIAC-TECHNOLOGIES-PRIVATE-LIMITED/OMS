/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `Client` table. All the data in the column will be lost.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `orderId` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `siteId` on the `Site` table. All the data in the column will be lost.
  - The primary key for the `Vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `vendorId` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "clientId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "orderId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
DROP COLUMN "siteId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Site_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_pkey",
DROP COLUMN "vendorId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
