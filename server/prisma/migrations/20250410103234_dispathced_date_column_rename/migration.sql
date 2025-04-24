/*
  Warnings:

  - You are about to drop the column `date` on the `DispatechDomains` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DispatechDomains" DROP COLUMN "date",
ADD COLUMN     "dispatchedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
