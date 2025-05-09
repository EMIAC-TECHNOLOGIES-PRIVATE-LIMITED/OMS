-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WebsiteType" ADD VALUE 'PR_Brand';
ALTER TYPE "WebsiteType" ADD VALUE 'PR_NonBrand';

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "domainAuthorityUpdateDate" TIMESTAMP(3);
