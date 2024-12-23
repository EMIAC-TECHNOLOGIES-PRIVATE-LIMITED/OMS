/*
  Warnings:

  - The `niche` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contact_from` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `site_category` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Site" DROP COLUMN "niche",
ADD COLUMN     "niche" TEXT,
DROP COLUMN "contact_from",
ADD COLUMN     "contact_from" TEXT,
DROP COLUMN "site_category",
ADD COLUMN     "site_category" TEXT;

-- DropEnum
DROP TYPE "ContactFrom";

-- DropEnum
DROP TYPE "Niche";

-- DropEnum
DROP TYPE "SiteCategory";
