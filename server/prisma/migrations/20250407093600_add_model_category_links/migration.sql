-- CreateTable
CREATE TABLE "CategoryLinks" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "site" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "CategoryLinks_pkey" PRIMARY KEY ("id")
);
