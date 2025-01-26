/*
  Warnings:

  - Made the column `name` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "linkSell" DROP NOT NULL,
ALTER COLUMN "contentSell" DROP NOT NULL,
ALTER COLUMN "totalAmountReceived" DROP NOT NULL,
ALTER COLUMN "totalOrders" DROP NOT NULL,
ALTER COLUMN "clientClientName" DROP NOT NULL,
ALTER COLUMN "clientCreatedAt" DROP NOT NULL,
ALTER COLUMN "clientProjects" DROP NOT NULL,
ALTER COLUMN "clientUpdatedAt" DROP NOT NULL,
ALTER COLUMN "contactedId" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "fbId" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "siteName" DROP NOT NULL,
ALTER COLUMN "source" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastLogin" DROP NOT NULL,
ALTER COLUMN "lastLogout" DROP NOT NULL,
ALTER COLUMN "loginId" DROP NOT NULL,
ALTER COLUMN "secureKey" DROP NOT NULL,
ALTER COLUMN "statusLogin" DROP NOT NULL,
ALTER COLUMN "superAppID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "name" SET NOT NULL;
