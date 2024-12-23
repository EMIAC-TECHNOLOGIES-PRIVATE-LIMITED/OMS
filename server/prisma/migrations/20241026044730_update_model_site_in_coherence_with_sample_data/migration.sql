/*
  Warnings:

  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `anchorText` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `bankDetails` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `bannerImagePrice` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `casinoAdult` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `cbdPrice` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `contactFrom` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `contactFromId` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `cpUpdateDate` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `indexedUrl` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `linkInsertionCost` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `mainCategory` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `numOfLinks` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `organicTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `organicTrafficLastUpdateDate` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `personId` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `priceCategory` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `pureCategory` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `sailingPrice` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `sampleUrl` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFifthCountryName` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFifthCountryTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFirstCountryName` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFirstCountryTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFourthCountryName` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushFourthCountryTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushSecondCountryName` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushSecondCountryTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushThirdCountryName` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushThirdCountryTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `semrushUpdationDate` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `similarWebTraffic` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `siteCategory` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `siteUpdateDate` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `socialMediaPosting` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `spamScore` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `vendorCountry` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `vendorInvoiceStatus` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `webCategory` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `webCountry` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `webIp` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `websiteQuality` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `websiteStatus` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `websiteType` on the `Site` table. All the data in the column will be lost.
  - The `follow` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `person_id` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Made the column `traffic` on table `Site` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_userId_fkey";

-- DropIndex
DROP INDEX "Site_userId_idx";

-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
DROP COLUMN "anchorText",
DROP COLUMN "bankDetails",
DROP COLUMN "bannerImagePrice",
DROP COLUMN "casinoAdult",
DROP COLUMN "cbdPrice",
DROP COLUMN "contactFrom",
DROP COLUMN "contactFromId",
DROP COLUMN "cpUpdateDate",
DROP COLUMN "createdAt",
DROP COLUMN "indexedUrl",
DROP COLUMN "linkInsertionCost",
DROP COLUMN "mainCategory",
DROP COLUMN "numOfLinks",
DROP COLUMN "organicTraffic",
DROP COLUMN "organicTrafficLastUpdateDate",
DROP COLUMN "personId",
DROP COLUMN "phoneNumber",
DROP COLUMN "priceCategory",
DROP COLUMN "pureCategory",
DROP COLUMN "sailingPrice",
DROP COLUMN "sampleUrl",
DROP COLUMN "semrushFifthCountryName",
DROP COLUMN "semrushFifthCountryTraffic",
DROP COLUMN "semrushFirstCountryName",
DROP COLUMN "semrushFirstCountryTraffic",
DROP COLUMN "semrushFourthCountryName",
DROP COLUMN "semrushFourthCountryTraffic",
DROP COLUMN "semrushSecondCountryName",
DROP COLUMN "semrushSecondCountryTraffic",
DROP COLUMN "semrushThirdCountryName",
DROP COLUMN "semrushThirdCountryTraffic",
DROP COLUMN "semrushTraffic",
DROP COLUMN "semrushUpdationDate",
DROP COLUMN "similarWebTraffic",
DROP COLUMN "siteCategory",
DROP COLUMN "siteId",
DROP COLUMN "siteUpdateDate",
DROP COLUMN "socialMediaPosting",
DROP COLUMN "spamScore",
DROP COLUMN "userId",
DROP COLUMN "vendorCountry",
DROP COLUMN "vendorInvoiceStatus",
DROP COLUMN "webCategory",
DROP COLUMN "webCountry",
DROP COLUMN "webIp",
DROP COLUMN "websiteQuality",
DROP COLUMN "websiteStatus",
DROP COLUMN "websiteType",
ADD COLUMN     "anchor_text" TEXT,
ADD COLUMN     "bank_details" TEXT,
ADD COLUMN     "banner_image_price" INTEGER,
ADD COLUMN     "casino_adult" INTEGER,
ADD COLUMN     "cbd_price" INTEGER,
ADD COLUMN     "contact_from" TEXT,
ADD COLUMN     "contact_from_id" TEXT,
ADD COLUMN     "cp_update_date" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "indexed_url" TEXT,
ADD COLUMN     "link_insertion_cost" TEXT,
ADD COLUMN     "main_category" TEXT,
ADD COLUMN     "num_of_links" INTEGER,
ADD COLUMN     "organic_traffic" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "organic_traffic_last_update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "person_id" INTEGER NOT NULL,
ADD COLUMN     "phone_number" BIGINT,
ADD COLUMN     "price_category" TEXT NOT NULL DEFAULT 'Paid',
ADD COLUMN     "pure_category" TEXT,
ADD COLUMN     "sailing_price" INTEGER,
ADD COLUMN     "sample_url" TEXT,
ADD COLUMN     "semrush_fifth_country_name" TEXT,
ADD COLUMN     "semrush_fifth_country_traffic" BIGINT,
ADD COLUMN     "semrush_first_country_name" TEXT,
ADD COLUMN     "semrush_first_country_traffic" BIGINT,
ADD COLUMN     "semrush_fourth_country_name" TEXT,
ADD COLUMN     "semrush_fourth_country_traffic" BIGINT,
ADD COLUMN     "semrush_second_country_name" TEXT,
ADD COLUMN     "semrush_second_country_traffic" BIGINT,
ADD COLUMN     "semrush_third_country_name" TEXT,
ADD COLUMN     "semrush_third_country_traffic" BIGINT,
ADD COLUMN     "semrush_traffic" BIGINT,
ADD COLUMN     "semrush_updation_date" TIMESTAMP(3),
ADD COLUMN     "similarweb_traffic" BIGINT,
ADD COLUMN     "site_category" TEXT,
ADD COLUMN     "site_update_date" TEXT,
ADD COLUMN     "social_media_posting" TEXT NOT NULL DEFAULT 'No',
ADD COLUMN     "spam_score" INTEGER,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "vendor_country" TEXT,
ADD COLUMN     "vendor_invoice_status" TEXT NOT NULL DEFAULT 'Pending',
ADD COLUMN     "web_category" TEXT,
ADD COLUMN     "web_country" TEXT,
ADD COLUMN     "web_ip" TEXT,
ADD COLUMN     "website_quality" TEXT,
ADD COLUMN     "website_status" TEXT NOT NULL DEFAULT 'Normal',
ADD COLUMN     "website_type" TEXT NOT NULL DEFAULT 'Default',
DROP COLUMN "follow",
ADD COLUMN     "follow" TEXT NOT NULL DEFAULT 'Do-follow',
ALTER COLUMN "traffic" SET NOT NULL,
ALTER COLUMN "traffic" SET DEFAULT 0,
ADD CONSTRAINT "Site_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Site_user_id_idx" ON "Site"("user_id");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
