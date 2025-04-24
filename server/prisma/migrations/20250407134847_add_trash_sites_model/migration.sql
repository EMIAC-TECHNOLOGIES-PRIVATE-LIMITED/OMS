-- CreateTable
CREATE TABLE "TrashSites" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "pitchedFrom" TEXT,

    CONSTRAINT "TrashSites_pkey" PRIMARY KEY ("id")
);
