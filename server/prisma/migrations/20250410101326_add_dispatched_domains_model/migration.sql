-- CreateTable
CREATE TABLE "DispatechDomains" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "costPrice" INTEGER NOT NULL,
    "Organization" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "poc" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispatechDomains_pkey" PRIMARY KEY ("id")
);
