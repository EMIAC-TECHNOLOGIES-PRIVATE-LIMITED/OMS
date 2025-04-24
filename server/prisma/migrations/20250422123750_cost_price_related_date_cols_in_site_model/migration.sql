/*
  Warnings:

  - The `columnOrder` column on the `View` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "costPriceValidFrom" TIMESTAMP(3),
ADD COLUMN     "costPriceValidTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "View" DROP COLUMN "columnOrder",
ADD COLUMN     "columnOrder" TEXT[];
