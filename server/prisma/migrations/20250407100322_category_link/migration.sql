/*
  Warnings:

  - Added the required column `categoryLink` to the `CategoryLinks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoryLinks" ADD COLUMN     "categoryLink" TEXT NOT NULL;
