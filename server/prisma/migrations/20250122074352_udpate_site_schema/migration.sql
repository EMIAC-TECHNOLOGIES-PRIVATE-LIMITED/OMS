/*
  Warnings:

  - You are about to alter the column `traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `organic_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_fifth_country_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_first_country_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_fourth_country_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_second_country_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_third_country_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `semrush_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `similarweb_traffic` on the `Site` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The `site_update_date` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "organic_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "phone_number" SET DATA TYPE TEXT,
ALTER COLUMN "semrush_fifth_country_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "semrush_first_country_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "semrush_fourth_country_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "semrush_second_country_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "semrush_third_country_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "semrush_traffic" SET DATA TYPE INTEGER,
ALTER COLUMN "similarweb_traffic" SET DATA TYPE INTEGER,
DROP COLUMN "site_update_date",
ADD COLUMN     "site_update_date" TIMESTAMP(3),
ALTER COLUMN "vendor_id" SET DEFAULT 1;
