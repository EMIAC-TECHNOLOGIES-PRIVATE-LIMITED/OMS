// prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Create or update Permissions using the new `key` field
    const permissionsData = [
      { key: 'VIEW_SITES_ROUTE', description: 'Permission to view sites route' },
      { key: 'VIEW_VENDORS_ROUTE', description: 'Permission to view vendors route' },
      // Add other permissions if needed
    ];

    const permissions = await Promise.all(
      permissionsData.map(async (perm) => {
        return await prisma.permission.upsert({
          where: { key: perm.key },
          update: { description: perm.description },
          create: perm,
        });
      })
    );

    // Extract permission IDs
    const sitesPermission = permissions.find((p) => p.key === 'VIEW_SITES_ROUTE');
    const vendorsPermission = permissions.find((p) => p.key === 'VIEW_VENDORS_ROUTE');

    if (!sitesPermission || !vendorsPermission) {
      throw new Error('Required permissions not found after upsert.');
    }

    // Create or update Resources using the new `key` field
    const resourcesData = [
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
      {
        key: 'Vendor_Admin',
        columns: [
          'vendorId',
          'name',
          'phone',
          'email',
          'contactedFrom',
          'bankName',
          'accountNumber',
          'ifscCode',
          'paypalId',
          'userId',
          'timestamp',
          'skypeId',
          'upiId',
        ],
        description: 'Admin access to all Vendor columns',
      },
      // Note: No Vendor_Sales resource since sales have no access
    ];

    const resources = await Promise.all(
      resourcesData.map(async (res) => {
        return await prisma.resource.upsert({
          where: { key: res.key },
          update: { columns: res.columns, description: res.description },
          create: res,
        });
      })
    );

    // Extract resource IDs
    const adminSiteResource = resources.find((r) => r.key === 'Site_Admin');
    const salesSiteResource = resources.find((r) => r.key === 'Site_Sales');
    const adminVendorResource = resources.find((r) => r.key === 'Vendor_Admin');

    if (!adminSiteResource || !salesSiteResource || !adminVendorResource) {
      throw new Error('Required resources not found after upsert.');
    }

    // Create or update Roles with their permissions and resources
    const rolesData = [
      {
        name: 'admin',
        permissions: {
          connect: [
            { id: sitesPermission.id },
            { id: vendorsPermission.id },
          ],
        },
        resources: {
          connect: [
            { id: adminSiteResource.id },
            { id: adminVendorResource.id },
          ],
        },
      },
      {
        name: 'sales',
        permissions: {
          connect: [{ id: sitesPermission.id }],
        },
        resources: {
          connect: [{ id: salesSiteResource.id }],
        },
      },
    ];

    for (const role of rolesData) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {
          permissions: {
            set: role.permissions.connect, // Reset permissions
          },
          resources: {
            set: role.resources.connect, // Reset resources
          },
        },
        create: role,
      });
      console.log(`Successfully upserted role: ${role.name}`);
    }

    console.log('Seed data upserted successfully!');
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
