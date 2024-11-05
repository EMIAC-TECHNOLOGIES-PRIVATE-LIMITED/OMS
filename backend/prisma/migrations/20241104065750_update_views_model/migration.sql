/*
  Warnings:

  - Added the required column `sort` to the `View` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "View" ADD COLUMN     "groupBy" TEXT[],
ADD COLUMN     "sort" JSONB NOT NULL;
