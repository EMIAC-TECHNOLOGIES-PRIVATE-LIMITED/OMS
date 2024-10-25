// seed.mjs

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {

    // Upsert Permissions
    await prisma.permission.upsert({
      where: { description: 'access /sales route' },
      update: {},
      create: { description: 'access /sales route' },
    });

    await prisma.permission.upsert({
      where: { description: 'access /content route' },
      update: {},
      create: { description: 'access /content route' },
    });

    // Upsert Resources
    await prisma.resource.upsert({
      where: { description: 'sales master data view' },
      update: {},
      create: {
        tableId: 'MasterData',
        columns: ['orderNumber', 'clientName', 'clientEmail', 'houseCost', 'priceQuoted'],
        description: 'sales master data view',
      },
    });

    await prisma.resource.upsert({
      where: { description: 'content master data view' },
      update: {},
      create: {
        tableId: 'MasterData',
        columns: ['orderNumber', 'clientName', 'clientEmail', 'contentCategory', 'contentLink'],
        description: 'content master data view',
      },
    });

    await prisma.resource.upsert({
      where: { description: 'admin master data view' },
      update: {},
      create: {
        tableId: 'MasterData',
        columns: [
          'orderNumber',
          'clientName',
          'clientEmail',
          'contentCategory',
          'contentLink',
          'houseCost',
          'priceQuoted',
        ],
        description: 'admin master data view',
      },
    });

    // Retrieve Permissions and Resources
    const salesPermission = await prisma.permission.findUnique({
      where: { description: 'access /sales route' },
    });

    const contentPermission = await prisma.permission.findUnique({
      where: { description: 'access /content route' },
    });

    const salesResource = await prisma.resource.findUnique({
      where: { description: 'sales master data view' },
    });

    const contentResource = await prisma.resource.findUnique({
      where: { description: 'content master data view' },
    });

    const adminResource = await prisma.resource.findUnique({
      where: { description: 'admin master data view' },
    });

    // Upsert Roles
    await prisma.role.upsert({
      where: { name: 'admin' },
      update: {
        permissions: {
          connect: [
            { id: salesPermission.id },
            { id: contentPermission.id },
          ],
        },
        resources: {
          connect: [{ id: adminResource.id }],
        },
      },
      create: {
        name: 'admin',
        permissions: {
          connect: [
            { id: salesPermission.id },
            { id: contentPermission.id },
          ],
        },
        resources: {
          connect: [{ id: adminResource.id }],
        },
      },
    });

    await prisma.role.upsert({
      where: { name: 'sales' },
      update: {
        permissions: {
          connect: [{ id: salesPermission.id }],
        },
        resources: {
          connect: [{ id: salesResource.id }],
        },
      },
      create: {
        name: 'sales',
        permissions: {
          connect: [{ id: salesPermission.id }],
        },
        resources: {
          connect: [{ id: salesResource.id }],
        },
      },
    });

    await prisma.role.upsert({
      where: { name: 'content' },
      update: {
        permissions: {
          connect: [{ id: contentPermission.id }],
        },
        resources: {
          connect: [{ id: contentResource.id }],
        },
      },
      create: {
        name: 'content',
        permissions: {
          connect: [{ id: contentPermission.id }],
        },
        resources: {
          connect: [{ id: contentResource.id }],
        },
      },
    });

    // Upsert MasterData Entries
    await prisma.masterData.upsert({
      where: { orderNumber: 1001 },
      update: {},
      create: {
        orderNumber: 1001,
        clientName: 'Tech Solutions Inc',
        clientEmail: 'contact@techsolutions.com',
        contentCategory: 'Technology',
        contentLink: 'https://example.com/tech-article',
        houseCost: 500,
        priceQuoted: 750,
      },
    });

    await prisma.masterData.upsert({
      where: { orderNumber: 1002 },
      update: {},
      create: {
        orderNumber: 1002,
        clientName: 'Green Energy Co',
        clientEmail: 'info@greenenergy.com',
        contentCategory: 'Environment',
        contentLink: 'https://example.com/green-energy',
        houseCost: 600,
        priceQuoted: 900,
      },
    });

    await prisma.masterData.upsert({
      where: { orderNumber: 1003 },
      update: {},
      create: {
        orderNumber: 1003,
        clientName: 'Fashion Forward',
        clientEmail: 'sales@fashionforward.com',
        contentCategory: 'Fashion',
        contentLink: 'https://example.com/fashion-trends',
        houseCost: 400,
        priceQuoted: 650,
      },
    });

    await prisma.masterData.upsert({
      where: { orderNumber: 1004 },
      update: {},
      create: {
        orderNumber: 1004,
        clientName: 'Health Plus',
        clientEmail: 'contact@healthplus.com',
        contentCategory: 'Healthcare',
        contentLink: 'https://example.com/health-article',
        houseCost: 550,
        priceQuoted: 800,
      },
    });

    await prisma.masterData.upsert({
      where: { orderNumber: 1005 },
      update: {},
      create: {
        orderNumber: 1005,
        clientName: 'Food Delights',
        clientEmail: 'info@fooddelights.com',
        contentCategory: 'Food & Beverage',
        contentLink: 'https://example.com/food-review',
        houseCost: 450,
        priceQuoted: 700,
      },
    });


    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
