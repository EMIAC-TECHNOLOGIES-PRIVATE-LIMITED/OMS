/*
  Warnings:

  - You are about to drop the column `Organization` on the `DispatechDomains` table. All the data in the column will be lost.
  - Added the required column `client` to the `DispatechDomains` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DispatechDomains" DROP COLUMN "Organization",
ADD COLUMN     "client" TEXT NOT NULL;
