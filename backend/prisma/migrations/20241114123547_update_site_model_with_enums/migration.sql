/*
  Warnings:

  - The `niche` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contact_from` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `site_category` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Niche" AS ENUM ('Multi', 'Tech', 'Business', 'Entertainment', 'Travel');

-- CreateEnum
CREATE TYPE "SiteCategory" AS ENUM ('FashionAndBeauty', 'FitnessAndSports', 'GeneralNews', 'Health', 'TechUpdates', 'Finance', 'Travel', 'Education', 'Entertainment', 'Lifestyle');

-- CreateEnum
CREATE TYPE "ContactFrom" AS ENUM ('CareAtOutreachdealCom', 'RishiJhangirEklavyaGuptaCom', 'VendorAtOutreachdealCom');

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "niche",
ADD COLUMN     "niche" "Niche",
DROP COLUMN "contact_from",
ADD COLUMN     "contact_from" "ContactFrom",
DROP COLUMN "site_category",
ADD COLUMN     "site_category" "SiteCategory";
