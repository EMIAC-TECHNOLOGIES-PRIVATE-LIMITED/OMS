/*
  Warnings:

  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
DROP COLUMN "id",
ADD COLUMN     "siteId" SERIAL NOT NULL,
ADD CONSTRAINT "Site_pkey" PRIMARY KEY ("siteId");
