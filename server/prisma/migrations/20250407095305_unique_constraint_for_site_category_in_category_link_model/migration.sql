/*
  Warnings:

  - A unique constraint covering the columns `[site,category]` on the table `CategoryLinks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryLinks_site_category_key" ON "CategoryLinks"("site", "category");
