/*
  Warnings:

  - The `follow` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Site" DROP COLUMN "follow",
ADD COLUMN     "follow" "Follow" NOT NULL DEFAULT 'Do_follow';
