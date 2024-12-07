// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.site.deleteMany();
    await prisma.permissionOverride.deleteMany();
    await prisma.resourceOverride.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.role.deleteMany();

    // Create Permissions using the new `key` field
    await prisma.permission.createMany({
      data: [
        { key: 'VIEW_SITES_ROUTE', description: 'Permission to view sites route' },
        // Add other permissions if needed
      ],
    });

    // Retrieve the created permission
    const [sitesPermission] = await prisma.permission.findMany({
      where: { key: 'VIEW_SITES_ROUTE' },
    });

    // Create Resources (defining column access for Site model) using the new `key` field
    await prisma.resource.createMany({
      data: [ 
        {
          key: 'Site_Admin',
          columns: [
            'id',
            'website',
            'niche',
            'site_category',
            'da',
            'pa',
            'person',
            'person_id',
            'price',
            'sailing_price',
            'discount',
            'adult',
            'casino_adult',
            'contact',
            'contact_from',
            'web_category',
            'follow',
            'price_category',
            'traffic',
            'spam_score',
            'cbd_price',
            'remark',
            'contact_from_id',
            'vendor_country',
            'phone_number',
            'sample_url',
            'bank_details',
            'dr',
            'user_id',
            'timestamp',
            'web_ip',
            'web_country',
            'link_insertion_cost',
            'tat',
            'social_media_posting',
            'semrush_traffic',
            'semrush_first_country_name',
            'semrush_first_country_traffic',
            'semrush_second_country_name',
            'semrush_second_country_traffic',
            'semrush_third_country_name',
            'semrush_third_country_traffic',
            'semrush_fourth_country_name',
            'semrush_fourth_country_traffic',
            'semrush_fifth_country_name',
            'semrush_fifth_country_traffic',
            'similarweb_traffic',
            'vendor_invoice_status',
            'main_category',
            'site_update_date',
            'website_type',
            'language',
            'gst',
            'disclaimer',
            'anchor_text',
            'banner_image_price',
            'cp_update_date',
            'pure_category',
            'availability',
            'indexed_url',
            'website_status',
            'website_quality',
            'num_of_links',
            'semrush_updation_date',
            'organic_traffic',
            'organic_traffic_last_update_date',
            'created_at',
          ],
          description: 'Admin access to all Site columns',
        },
        {
          key: 'Site_Sales',
          columns: [
            'id',
            'website',
            'price',
            'da',
            'pa',
            'niche',
            'site_category',
            'traffic',
            'dr',
            'main_category',
            'website_status',
          ],
          description: 'Sales team access to limited Site columns',
        },
      ],
    });

    // Retrieve the created resources
    const [adminResource, salesResource] = await prisma.resource.findMany({
      where: {
        key: { in: ['Site_Admin', 'Site_Sales'] },
      },
    });

    // Create Roles with their permissions and resources
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        permissions: {
          connect: [{ id: sitesPermission.id }],
        },
        resources: {
          connect: [{ id: adminResource.id }],
        },
      },
    });

    const salesRole = await prisma.role.create({
      data: {
        name: 'sales',
        permissions: {
          connect: [{ id: sitesPermission.id }],
        },
        resources: {
          connect: [{ id: salesResource.id }],
        },
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
