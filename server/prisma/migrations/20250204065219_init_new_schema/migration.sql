-- CreateEnum
CREATE TYPE "ClientPaymentStatus" AS ENUM ('Received', 'PartiallyReceived', 'Pending', 'NotReceived');

-- CreateEnum
CREATE TYPE "VendorPaymentStatus" AS ENUM ('Hold', 'Unpaid', 'Paid', 'PartiallyPaid', 'Cancel');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Given', 'Publish', 'NotPublish', 'Cancel', 'Replacement', 'NeedUpdate');

-- CreateEnum
CREATE TYPE "VendorInvoiceStatus" AS ENUM ('Pending', 'Ask', 'Received', 'Given', 'Paid');

-- CreateEnum
CREATE TYPE "SiteClassification" AS ENUM ('Normal', 'Casino', 'Cbd', 'Adult');

-- CreateEnum
CREATE TYPE "linkAttribute" AS ENUM ('DoFollow', 'NoFollow', 'Sponsored');

-- CreateEnum
CREATE TYPE "PriceCategory" AS ENUM ('Paid', 'Free', 'Exchange');

-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('Default', 'PR', 'Language');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('Normal', 'Blacklist', 'Disqualified');

-- CreateEnum
CREATE TYPE "WebsiteQuality" AS ENUM ('Pure', 'AlmostPure', 'Multi');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('Individual', 'Agency');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionOverride" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "granted" BOOLEAN NOT NULL,

    CONSTRAINT "PermissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceOverride" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "granted" BOOLEAN NOT NULL,

    CONSTRAINT "ResourceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "View" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "viewName" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "filterConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT[],
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "pitchedFrom" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "paypalId" TEXT,
    "skypeId" TEXT,
    "upiId" TEXT,
    "category" "VendorCategory",
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "pocId" INTEGER,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "contentCategories" TEXT NOT NULL,
    "siteClassification" "SiteClassification" NOT NULL DEFAULT 'Normal',
    "priceCategory" "PriceCategory" DEFAULT 'Paid',
    "domainAuthority" INTEGER NOT NULL,
    "pageAuthority" INTEGER NOT NULL,
    "linkAttribute" "linkAttribute" DEFAULT 'DoFollow',
    "ahrefTraffic" INTEGER,
    "spamScore" INTEGER NOT NULL,
    "domainRating" INTEGER,
    "socialMediaPosting" BOOLEAN,
    "costPrice" INTEGER NOT NULL,
    "sellingPrice" INTEGER NOT NULL,
    "discount" INTEGER,
    "adultPrice" INTEGER,
    "casinoAdultPrice" INTEGER,
    "cbdPrice" INTEGER,
    "linkInsertionCost" INTEGER,
    "websiteRemark" TEXT,
    "webIP" TEXT,
    "webCountry" TEXT,
    "turnAroundTime" TEXT,
    "semrushTraffic" INTEGER NOT NULL,
    "semrushFirstCountryName" TEXT,
    "semrushSecondCountryName" TEXT,
    "semrushFirstCountryTraffic" INTEGER,
    "semrushSecondCountryTraffic" INTEGER,
    "semrushThirdCountryName" TEXT,
    "semrushThirdCountryTraffic" INTEGER,
    "semrushFourthCountryName" TEXT,
    "semrushFourthCountryTraffic" INTEGER,
    "semrushFifthCountryName" TEXT,
    "semrushFifthCountryTraffic" INTEGER,
    "similarwebTraffic" INTEGER,
    "siteUpdateDate" TIMESTAMP(3),
    "websiteType" "WebsiteType" DEFAULT 'Default',
    "language" TEXT,
    "disclaimer" TEXT,
    "anchorText" BOOLEAN,
    "bannerImagePrice" INTEGER,
    "costPriceUpdateDate" TIMESTAMP(3),
    "pureCategory" TEXT,
    "availability" BOOLEAN DEFAULT false,
    "isIndexed" BOOLEAN,
    "websiteStatus" "WebsiteStatus" NOT NULL DEFAULT 'Normal',
    "websiteQuality" "WebsiteQuality" DEFAULT 'Pure',
    "numberOfLinks" INTEGER,
    "semrushUpdateDate" TIMESTAMP(3),
    "semrushOrganicTraffic" INTEGER NOT NULL DEFAULT 0,
    "semrushOrganicTrafficLastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" INTEGER DEFAULT 1,
    "pocId" INTEGER,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "fbId" TEXT,
    "contactedFrom" TEXT,
    "website" TEXT,
    "source" TEXT,
    "clientClientName" TEXT,
    "projects" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "pocId" INTEGER DEFAULT 1,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderDate" TIMESTAMP(3),
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "vendorAssignedDate" TIMESTAMP(3),
    "orderStatusUpdateDate" TIMESTAMP(3),
    "publishDate" TIMESTAMP(3),
    "publishURL" TEXT,
    "orderRemark" TEXT,
    "mainRemark" TEXT,
    "clientPaymentRemark" TEXT,
    "clientContentCost" INTEGER,
    "clientProposedAmount" INTEGER,
    "clientPaymentStatus" "ClientPaymentStatus" DEFAULT 'Pending',
    "clientReceivedAmount" INTEGER,
    "clientPaymentDate" TIMESTAMP(3),
    "vendorInvoiceStatus" "VendorInvoiceStatus" DEFAULT 'Pending',
    "vendorPaymentStatus" "VendorPaymentStatus" DEFAULT 'Unpaid',
    "vendorPaymentDate" TIMESTAMP(3),
    "vendorPaymentAmount" INTEGER,
    "invoiceNumber" TEXT,
    "costPriceWithGST" INTEGER,
    "indexedScreenShotLink" TEXT,
    "siteId" INTEGER,
    "salesPersonId" INTEGER,
    "clientId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RoleResources" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_key_key" ON "Resource"("key");

-- CreateIndex
CREATE INDEX "PermissionOverride_userId_permissionId_idx" ON "PermissionOverride"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionOverride_userId_permissionId_key" ON "PermissionOverride"("userId", "permissionId");

-- CreateIndex
CREATE INDEX "ResourceOverride_userId_resourceId_idx" ON "ResourceOverride"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceOverride_userId_resourceId_key" ON "ResourceOverride"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "View_userId_idx" ON "View"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "Client_pocId_idx" ON "Client"("pocId");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_salesPersonId_idx" ON "Order"("salesPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "_RolePermissions_AB_unique" ON "_RolePermissions"("A", "B");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleResources_AB_unique" ON "_RoleResources"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleResources_B_index" ON "_RoleResources"("B");

-- AddForeignKey
ALTER TABLE "PermissionOverride" ADD CONSTRAINT "PermissionOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionOverride" ADD CONSTRAINT "PermissionOverride_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceOverride" ADD CONSTRAINT "ResourceOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceOverride" ADD CONSTRAINT "ResourceOverride_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_pocId_fkey" FOREIGN KEY ("pocId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_pocId_fkey" FOREIGN KEY ("pocId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_pocId_fkey" FOREIGN KEY ("pocId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleResources" ADD CONSTRAINT "_RoleResources_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleResources" ADD CONSTRAINT "_RoleResources_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
