/*
  Warnings:

  - You are about to drop the column `person` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the column `person_id` on the `Site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Site" DROP COLUMN "person",
DROP COLUMN "person_id";
