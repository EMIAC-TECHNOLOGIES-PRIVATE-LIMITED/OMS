/*
  Warnings:

  - You are about to drop the column `category` on the `Site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Site" DROP COLUMN "category";

-- CreateTable
CREATE TABLE "SiteCategory" (
    "id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "SiteCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SiteToSiteCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteCategory_category_key" ON "SiteCategory"("category");

-- CreateIndex
CREATE UNIQUE INDEX "_SiteToSiteCategory_AB_unique" ON "_SiteToSiteCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_SiteToSiteCategory_B_index" ON "_SiteToSiteCategory"("B");

-- AddForeignKey
ALTER TABLE "_SiteToSiteCategory" ADD CONSTRAINT "_SiteToSiteCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SiteToSiteCategory" ADD CONSTRAINT "_SiteToSiteCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SiteCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
