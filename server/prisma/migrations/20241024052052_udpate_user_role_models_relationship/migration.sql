/*
  Warnings:

  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `clientClientName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientProjects` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientUpdatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactedId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fbId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualPaidAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualReceivedAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientAmountReceived` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientAmountReceivedDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentDoc` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indexedUrl` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceStatus` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderOperatedBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderOperatedUpdateBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderedBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderedUpdatedBy` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentRemark` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paypalId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceWithGST` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposedAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remark` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteCost` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusUpdateDatetime` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorAccountType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorContactedFrom` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorPaymentAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorPaymentDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorPaymentStatus` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorTransactionId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorWebsiteRemark` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteRemark` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastLogin` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastLogout` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loginId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secureKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superAppID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `roleId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `phone` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skypeId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upiId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusLogin" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('RECEIVED', 'PARTIALLY_RECEIVED', 'PENDING', 'NOT_RECEIVED');

-- CreateEnum
CREATE TYPE "VendorPaymentStatus" AS ENUM ('HOLD', 'UNPAID', 'PAID', 'PARTIALLY_PAID', 'CANCEL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'GIVEN', 'PUBLISH', 'NOT_PUBLISH', 'CANCEL', 'REPLACEMENT', 'NEED_UPDATE');

-- CreateEnum
CREATE TYPE "VendorInvoiceStatus" AS ENUM ('PENDING', 'ASK', 'RECEIVED', 'GIVEN', 'PAID');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('NORMAL', 'CASINO', 'ADULT', 'CBD');

-- CreateEnum
CREATE TYPE "Follow" AS ENUM ('Do_follow', 'No_follow', 'Sponsored');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('Paid', 'Free', 'Exchange');

-- CreateEnum
CREATE TYPE "Posting" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('Default', 'PR', 'Language');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('Normal', 'Blacklist', 'Disqualified');

-- CreateEnum
CREATE TYPE "WebsiteQuality" AS ENUM ('Pure', 'Almost_Pure', 'Multi');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "clientClientName" TEXT NOT NULL,
ADD COLUMN     "clientCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "clientProjects" TEXT NOT NULL,
ADD COLUMN     "clientUpdatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "contactedId" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fbId" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "siteName" TEXT NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "actualPaidAmount" INTEGER NOT NULL,
ADD COLUMN     "actualReceivedAmount" INTEGER NOT NULL,
ADD COLUMN     "clientAmountReceived" INTEGER NOT NULL,
ADD COLUMN     "clientAmountReceivedDate" TEXT NOT NULL,
ADD COLUMN     "clientAmountReceivedStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'NOT_RECEIVED',
ADD COLUMN     "contentAmount" INTEGER NOT NULL,
ADD COLUMN     "contentDoc" TEXT NOT NULL,
ADD COLUMN     "indexedUrl" TEXT NOT NULL,
ADD COLUMN     "invoiceNo" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "invoiceStatus" TEXT NOT NULL,
ADD COLUMN     "orderOperatedBy" INTEGER NOT NULL,
ADD COLUMN     "orderOperatedUpdateBy" INTEGER NOT NULL,
ADD COLUMN     "orderedBy" INTEGER NOT NULL,
ADD COLUMN     "orderedUpdatedBy" INTEGER NOT NULL,
ADD COLUMN     "paymentRemark" TEXT NOT NULL,
ADD COLUMN     "paypalId" TEXT NOT NULL,
ADD COLUMN     "priceWithGST" INTEGER NOT NULL,
ADD COLUMN     "proposedAmount" INTEGER NOT NULL,
ADD COLUMN     "remark" TEXT NOT NULL,
ADD COLUMN     "siteCost" INTEGER NOT NULL,
ADD COLUMN     "siteType" "SiteType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusUpdateDatetime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "vendorAccountType" TEXT NOT NULL,
ADD COLUMN     "vendorContactedFrom" TEXT NOT NULL,
ADD COLUMN     "vendorEmail" TEXT NOT NULL,
ADD COLUMN     "vendorInvoiceStatus" "VendorInvoiceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "vendorName" TEXT NOT NULL,
ADD COLUMN     "vendorPaymentAmount" INTEGER NOT NULL,
ADD COLUMN     "vendorPaymentDate" TEXT NOT NULL,
ADD COLUMN     "vendorPaymentStatus" "VendorPaymentStatus" NOT NULL,
ADD COLUMN     "vendorTransactionId" TEXT NOT NULL,
ADD COLUMN     "vendorWebsiteRemark" TEXT NOT NULL,
ADD COLUMN     "website" TEXT NOT NULL,
ADD COLUMN     "websiteRemark" TEXT NOT NULL,
ADD COLUMN     "websiteType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TEXT NOT NULL,
ADD COLUMN     "lastLogout" TEXT NOT NULL,
ADD COLUMN     "loginId" INTEGER NOT NULL,
ADD COLUMN     "secureKey" TEXT NOT NULL,
ADD COLUMN     "statusLogin" "StatusLogin" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "superAppID" INTEGER NOT NULL,
DROP COLUMN "roleId",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "skypeId" TEXT NOT NULL,
ADD COLUMN     "timestamp" TEXT NOT NULL,
ADD COLUMN     "upiId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Site" (
    "siteId" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "niche" TEXT,
    "siteCategory" TEXT,
    "da" INTEGER NOT NULL,
    "pa" INTEGER NOT NULL,
    "person" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "sailingPrice" INTEGER,
    "discount" INTEGER,
    "adult" INTEGER,
    "casinoAdult" INTEGER,
    "contact" TEXT,
    "contactFrom" TEXT,
    "webCategory" TEXT,
    "follow" "Follow" NOT NULL DEFAULT 'Do_follow',
    "priceCategory" "PriceType" NOT NULL DEFAULT 'Paid',
    "traffic" BIGINT,
    "spamScore" INTEGER,
    "cbdPrice" INTEGER,
    "remark" TEXT,
    "contactFromId" TEXT,
    "vendorCountry" TEXT,
    "phoneNumber" BIGINT,
    "sampleUrl" TEXT,
    "bankDetails" TEXT,
    "dr" INTEGER,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webIp" TEXT,
    "webCountry" TEXT,
    "linkInsertionCost" TEXT,
    "tat" TEXT,
    "socialMediaPosting" "Posting" NOT NULL DEFAULT 'No',
    "semrushTraffic" BIGINT,
    "semrushFirstCountryName" TEXT,
    "semrushFirstCountryTraffic" BIGINT,
    "semrushSecondCountryName" TEXT,
    "semrushSecondCountryTraffic" BIGINT,
    "semrushThirdCountryName" TEXT,
    "semrushThirdCountryTraffic" BIGINT,
    "semrushFourthCountryName" TEXT,
    "semrushFourthCountryTraffic" BIGINT,
    "semrushFifthCountryName" TEXT,
    "semrushFifthCountryTraffic" BIGINT,
    "similarWebTraffic" BIGINT,
    "vendorInvoiceStatus" "VendorInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "mainCategory" TEXT,
    "siteUpdateDate" TEXT,
    "websiteType" "WebsiteType" NOT NULL DEFAULT 'Default',
    "language" TEXT,
    "gst" TEXT,
    "disclaimer" TEXT,
    "anchorText" TEXT,
    "bannerImagePrice" INTEGER,
    "cpUpdateDate" TIMESTAMP(3),
    "pureCategory" TEXT,
    "availability" TEXT,
    "indexedUrl" TEXT,
    "websiteStatus" "WebsiteStatus" NOT NULL DEFAULT 'Normal',
    "websiteQuality" "WebsiteQuality",
    "numOfLinks" INTEGER,
    "semrushUpdationDate" TIMESTAMP(3),
    "organicTraffic" BIGINT NOT NULL,
    "organicTrafficLastUpdateDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("siteId")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
