// prisma/seed.mjs

import { PrismaClient, OrderPaymentStatus, VendorPaymentStatus, OrderStatus, VendorInvoiceStatus, SiteType, Follow, PriceType, Posting, WebsiteType, WebsiteStatus, WebsiteQuality } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create Permissions
    await prisma.permission.createMany({
        data: [
            { key: 'view_orders', description: 'View Orders' },
            { key: 'edit_orders', description: 'Edit Orders' },
            { key: 'delete_orders', description: 'Delete Orders' },
            { key: 'view_clients', description: 'View Clients' },
            { key: 'edit_clients', description: 'Edit Clients' },
            { key: 'delete_clients', description: 'Delete Clients' },
            { key: 'view_vendors', description: 'View Vendors' },
            { key: 'edit_vendors', description: 'Edit Vendors' },
            { key: 'delete_vendors', description: 'Delete Vendors' },
            { key: 'view_sites', description: 'View Sites' },
            { key: 'edit_sites', description: 'Edit Sites' },
            { key: 'delete_sites', description: 'Delete Sites' },
        ],
        skipDuplicates: true,
    });

    // Create Resources
    await prisma.resource.createMany({
        data: [
            { table: 'Order', column: 'publishStatus', description: 'Publish Status of Order' },
            { table: 'Order', column: 'transactionAmount', description: 'Transaction Amount of Order' },
            { table: 'Client', column: 'linkSell', description: 'Link Sell of Client' },
            { table: 'Client', column: 'contentSell', description: 'Content Sell of Client' },
            { table: 'Vendor', column: 'bankName', description: 'Bank Name of Vendor' },
            { table: 'Site', column: 'website', description: 'Website URL of Site' },
            // Add more resources as needed
        ],
        skipDuplicates: true,
    });

    // Fetch Permissions and Resources
    const allPermissions = await prisma.permission.findMany();
    const allResources = await prisma.resource.findMany();

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            permissions: {
                connect: allPermissions.map(p => ({ id: p.id })),
            },
            resources: {
                connect: allResources.map(r => ({ id: r.id })),
            },
        },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: {
            name: 'User',
            permissions: {
                connect: allPermissions
                    .filter(p => ['view_orders', 'view_clients', 'view_vendors', 'view_sites'].includes(p.key))
                    .map(p => ({ id: p.id })),
            },
            resources: {
                connect: allResources
                    .filter(r => ['Order', 'Client', 'Vendor', 'Site'].includes(r.table))
                    .map(r => ({ id: r.id })),
            },
        },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'Manager' },
        update: {},
        create: {
            name: 'Manager',
            permissions: {
                connect: allPermissions
                    .filter(p => ['view_orders', 'edit_orders', 'view_clients', 'edit_clients', 'view_vendors', 'edit_vendors', 'view_sites', 'edit_sites'].includes(p.key))
                    .map(p => ({ id: p.id })),
            },
            resources: {
                connect: allResources
                    .filter(r => ['Order', 'Client', 'Vendor', 'Site'].includes(r.table))
                    .map(r => ({ id: r.id })),
            },
        },
    });

    // Fetch Roles by Name to get their IDs
    const adminRoleFetched = await prisma.role.findUnique({ where: { name: 'Admin' } });
    const userRoleFetched = await prisma.role.findUnique({ where: { name: 'User' } });
    const managerRoleFetched = await prisma.role.findUnique({ where: { name: 'Manager' } });

    if (!adminRoleFetched || !userRoleFetched || !managerRoleFetched) {
        throw new Error('Roles were not created properly.');
    }

    // Assume Users are already created via /signup in the following order:
    // 1. Admin User (ID: 1)
    // 2. Normal User (ID: 2)
    // 3. Manager User (ID: 3)
    // 4. Suspended User (ID: 4)

    // Create Permission Overrides for Normal User (User ID: 2)
    const editOrdersPermission = allPermissions.find(p => p.key === 'edit_orders');
    if (editOrdersPermission) {
        await prisma.permissionOverride.upsert({
            where: {
                userId_permissionId: {
                    userId: 2,
                    permissionId: editOrdersPermission.id,
                },
            },
            update: { granted: true },
            create: {
                userId: 2,
                permissionId: editOrdersPermission.id,
                granted: true,
            },
        });
    }

    // Create Resource Overrides for Manager User (User ID: 3)
    const vendorBankNameResource = allResources.find(r => r.table === 'Vendor' && r.column === 'bankName');
    if (vendorBankNameResource) {
        await prisma.resourceOverride.upsert({
            where: {
                userId_resourceId: {
                    userId: 3,
                    resourceId: vendorBankNameResource.id,
                },
            },
            update: { granted: false },
            create: {
                userId: 3,
                resourceId: vendorBankNameResource.id,
                granted: false,
            },
        });
    }

    // Create Clients
    const client1 = await prisma.client.create({
        data: {
            name: 'Client A',
            linkSell: 100,
            contentSell: 200,
            totalAmountReceived: 300,
            totalOrders: 2,
            salesPersonId: 1, // Admin User
            phone: '1234567890',
            email: 'clienta@example.com',
            fbId: 'fb_clienta',
            contactedId: 'contacta',
            siteName: 'Site A',
            source: 'Referral',
            userId: 2, // Normal User
            clientClientName: 'Client A Name',
            clientProjects: 'Project A1, Project A2',
        },
    });

    const client2 = await prisma.client.create({
        data: {
            name: 'Client B',
            linkSell: 150,
            contentSell: 250,
            totalAmountReceived: 400,
            totalOrders: 3,
            salesPersonId: 3, // Manager User
            phone: '0987654321',
            email: 'clientb@example.com',
            fbId: 'fb_clientb',
            contactedId: 'contactb',
            siteName: 'Site B',
            source: 'Advertisement',
            userId: 2, // Normal User
            clientClientName: 'Client B Name',
            clientProjects: 'Project B1, Project B2, Project B3',
        },
    });

    // Create Vendors
    const vendor1 = await prisma.vendor.create({
        data: {
            name: 'Vendor X',
            phone: '1112223333',
            email: 'vendorx@example.com',
            contactedFrom: 'Email',
            bankName: 'Bank X',
            accountNumber: '123456789',
            ifscCode: 'IFSC0001',
            paypalId: 'paypal_vendorx',
            userId: 1, // Admin User
            timestamp: new Date().toISOString(),
            skypeId: 'skype_vendorx',
            upiId: 'upi_vendorx@bank',
        },
    });

    const vendor2 = await prisma.vendor.create({
        data: {
            name: 'Vendor Y',
            phone: '4445556666',
            email: 'vendory@example.com',
            contactedFrom: 'Phone',
            bankName: 'Bank Y',
            accountNumber: '987654321',
            ifscCode: 'IFSC0002',
            paypalId: 'paypal_vendory',
            userId: 3, // Manager User
            timestamp: new Date().toISOString(),
            skypeId: 'skype_vendory',
            upiId: 'upi_vendory@bank',
        },
    });

    // Create Orders
    const order1 = await prisma.order.create({
        data: {
            clientId: client1.clientId,
            orderDate: new Date(),
            publishStatus: true,
            publishDate: new Date(),
            publishLink: 'https://publishlink1.com',
            transactionAmount: 500,
            receivedAmount: 300,
            accountType: 'Savings',
            accountId: 101,
            proposedAmount: 600,
            contentAmount: 400,
            website: 'https://website1.com',
            websiteRemark: 'Good',
            vendorEmail: 'vendorx@example.com',
            vendorName: 'Vendor X',
            siteCost: 200,
            vendorContactedFrom: 'Email',
            remark: 'Urgent',
            vendorWebsiteRemark: 'Excellent',
            clientAmountReceived: 300,
            clientAmountReceivedDate: '2023-10-01',
            clientAmountReceivedStatus: OrderPaymentStatus.RECEIVED,
            vendorPaymentAmount: 150,
            vendorAccountType: 'Savings',
            vendorPaymentStatus: VendorPaymentStatus.PAID,
            vendorPaymentDate: '2023-10-05',
            vendorTransactionId: 'txn_12345',
            orderedBy: 1, // Admin User
            orderedUpdatedBy: 1, // Admin User
            orderOperatedBy: 3, // Manager User
            orderOperatedUpdateBy: 3, // Manager User
            userId: 2, // Normal User
            paypalId: 'paypal_order1',
            status: OrderStatus.PENDING,
            contentDoc: 'Document Content',
            vendorInvoiceStatus: VendorInvoiceStatus.PENDING,
            paymentRemark: 'First payment',
            actualReceivedAmount: 300,
            actualPaidAmount: 150,
            siteType: SiteType.NORMAL,
            websiteType: 'Default',
            invoiceNo: 'INV001',
            invoiceStatus: 'Pending',
            priceWithGST: 550,
            indexedUrl: 'https://indexedurl1.com',
            statusUpdateDatetime: new Date(),
        },
    });

    const order2 = await prisma.order.create({
        data: {
            clientId: client2.clientId,
            orderDate: new Date(),
            publishStatus: false,
            publishDate: new Date(),
            publishLink: 'https://publishlink2.com',
            transactionAmount: 800,
            receivedAmount: 500,
            accountType: 'Current',
            accountId: 102,
            proposedAmount: 900,
            contentAmount: 600,
            website: 'https://website2.com',
            websiteRemark: 'Average',
            vendorEmail: 'vendory@example.com',
            vendorName: 'Vendor Y',
            siteCost: 300,
            vendorContactedFrom: 'Phone',
            remark: 'Standard',
            vendorWebsiteRemark: 'Good',
            clientAmountReceived: 500,
            clientAmountReceivedDate: '2023-10-02',
            clientAmountReceivedStatus: OrderPaymentStatus.PARTIALLY_RECEIVED,
            vendorPaymentAmount: 250,
            vendorAccountType: 'Current',
            vendorPaymentStatus: VendorPaymentStatus.UNPAID,
            vendorPaymentDate: '2023-10-06',
            vendorTransactionId: 'txn_67890',
            orderedBy: 3, // Manager User
            orderedUpdatedBy: 3, // Manager User
            orderOperatedBy: 1, // Admin User
            orderOperatedUpdateBy: 1, // Admin User
            userId: 2, // Normal User
            paypalId: 'paypal_order2',
            status: OrderStatus.GIVEN,
            contentDoc: 'Document Content 2',
            vendorInvoiceStatus: VendorInvoiceStatus.ASK,
            paymentRemark: 'Second payment',
            actualReceivedAmount: 500,
            actualPaidAmount: 250,
            siteType: SiteType.CASINO,
            websiteType: 'PR',
            invoiceNo: 'INV002',
            invoiceStatus: 'Ask',
            priceWithGST: 850,
            indexedUrl: 'https://indexedurl2.com',
            statusUpdateDatetime: new Date(),
        },
    });

    // Create Sites
    const site1 = await prisma.site.create({
        data: {
            website: 'https://site1.com',
            niche: 'Technology',
            site_category: 'Blog',
            da: 50,
            pa: 45,
            person: 'John Doe',
            person_id: 1,
            price: 1000,
            sailing_price: 900,
            discount: 10,
            adult: 0,
            casino_adult: 0,
            contact: 'contact@site1.com',
            contact_from: 'Email',
            web_category: 'Tech',
            follow: Follow.Do_follow,
            price_category: PriceType.Paid,
            traffic: BigInt(100000),
            spam_score: 5,
            cbd_price: 50,
            remark: 'Good site',
            contact_from_id: 'contact1',
            vendor_country: 'USA',
            phone_number: BigInt(1234567890),
            sample_url: 'https://sample1.com',
            bank_details: 'Bank Details 1',
            dr: 70,
            user_id: 1, // Admin User
            web_ip: '192.168.1.1',
            web_country: 'USA',
            link_insertion_cost: '100',
            tat: '24h',
            social_media_posting: Posting.No,
            semrush_traffic: BigInt(50000),
            semrush_first_country_name: 'USA',
            semrush_first_country_traffic: BigInt(30000),
            semrush_second_country_name: 'Canada',
            semrush_second_country_traffic: BigInt(20000),
            semrush_third_country_name: 'UK',
            semrush_third_country_traffic: BigInt(10000),
            semrush_fourth_country_name: 'Australia',
            semrush_fourth_country_traffic: BigInt(5000),
            semrush_fifth_country_name: 'India',
            semrush_fifth_country_traffic: BigInt(2500),
            similarweb_traffic: BigInt(40000),
            vendor_invoice_status: VendorInvoiceStatus.PENDING,
            main_category: 'Technology',
            site_update_date: '2023-10-10',
            website_type: WebsiteType.Default,
            language: 'English',
            gst: 'GST12345',
            disclaimer: 'None',
            anchor_text: 'Technology Blog',
            banner_image_price: 200,
            cp_update_date: new Date(),
            pure_category: 'Pure Tech',
            availability: 'Available',
            indexed_url: 'https://indexedsite1.com',
            website_status: WebsiteStatus.Normal,
            website_quality: WebsiteQuality.Pure,
            num_of_links: 100,
            semrush_updation_date: new Date(),
            organic_traffic: BigInt(80000),
            organic_traffic_last_update_date: new Date(),
            created_at: new Date(),
        },
    });

    const site2 = await prisma.site.create({
        data: {
            website: 'https://site2.com',
            niche: 'Health',
            site_category: 'E-commerce',
            da: 60,
            pa: 55,
            person: 'Jane Smith',
            person_id: 2,
            price: 1500,
            sailing_price: 1400,
            discount: 15,
            adult: 1,
            casino_adult: 1,
            contact: 'contact@site2.com',
            contact_from: 'Phone',
            web_category: 'Health',
            follow: Follow.No_follow,
            price_category: PriceType.Free,
            traffic: BigInt(200000),
            spam_score: 10,
            cbd_price: 75,
            remark: 'Excellent site',
            contact_from_id: 'contact2',
            vendor_country: 'Canada',
            phone_number: BigInt(9876543210),
            sample_url: 'https://sample2.com',
            bank_details: 'Bank Details 2',
            dr: 80,
            user_id: 3, // Manager User
            web_ip: '192.168.1.2',
            web_country: 'Canada',
            link_insertion_cost: '150',
            tat: '48h',
            social_media_posting: Posting.Yes,
            semrush_traffic: BigInt(120000),
            semrush_first_country_name: 'Canada',
            semrush_first_country_traffic: BigInt(70000),
            semrush_second_country_name: 'USA',
            semrush_second_country_traffic: BigInt(50000),
            semrush_third_country_name: 'UK',
            semrush_third_country_traffic: BigInt(30000),
            semrush_fourth_country_name: 'Germany',
            semrush_fourth_country_traffic: BigInt(15000),
            semrush_fifth_country_name: 'France',
            semrush_fifth_country_traffic: BigInt(7500),
            similarweb_traffic: BigInt(90000),
            vendor_invoice_status: VendorInvoiceStatus.ASK,
            main_category: 'Health',
            site_update_date: '2023-10-15',
            website_type: WebsiteType.PR,
            language: 'French',
            gst: 'GST67890',
            disclaimer: 'Health Disclaimer',
            anchor_text: 'Health Store',
            banner_image_price: 300,
            cp_update_date: new Date(),
            pure_category: 'Health Products',
            availability: 'Limited',
            indexed_url: 'https://indexedsite2.com',
            website_status: WebsiteStatus.Blacklist,
            website_quality: WebsiteQuality.Almost_Pure,
            num_of_links: 150,
            semrush_updation_date: new Date(),
            organic_traffic: BigInt(160000),
            organic_traffic_last_update_date: new Date(),
            created_at: new Date(),
        },
    });

    // Create Views
    await prisma.view.create({
        data: {
            userId: 1, // Admin User
            tableId: 'Order',
            viewName: 'Admin Order View',
            columns: ['orderId', 'clientId', 'orderDate', 'publishStatus', 'transactionAmount'],
            filters: {
                AND: [
                    { status: OrderStatus.PENDING },
                    { publishStatus: true },
                ],
            },
            sort: [
                { orderDate: 'desc' },
                { transactionAmount: 'asc' },
            ],
            groupBy: [],
        },
    });

    await prisma.view.create({
        data: {
            userId: 2, // Normal User
            tableId: 'Client',
            viewName: 'User Client View',
            columns: ['clientId', 'name', 'email', 'linkSell', 'contentSell'],
            filters: {
                OR: [
                    { totalOrders: { gte: 2 } },
                    { totalAmountReceived: { gte: 300 } },
                ],
            },
            sort: [
                { name: 'asc' },
            ],
            groupBy: [],
        },
    });

    // Create MasterData
    await prisma.masterData.createMany({
        data: [
            {
                orderNumber: 1001,
                clientName: 'Client A',
                clientEmail: 'clienta@example.com',
                contentCategory: 'Technology',
                contentLink: 'https://contentlink1.com',
                houseCost: 500,
                priceQuoted: 700,
            },
            {
                orderNumber: 1002,
                clientName: 'Client B',
                clientEmail: 'clientb@example.com',
                contentCategory: 'Health',
                contentLink: 'https://contentlink2.com',
                houseCost: 600,
                priceQuoted: 800,
            },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Seed data successfully created.');

    console.log('📄 Instructions for User Signup:');
    console.log('1. Sign up the following users in this exact order to ensure correct user IDs:');
    console.log('   - Admin User:');
    console.log('     Email: admin@example.com');
    console.log('     Password: AdminPass123');
    console.log('     Role: Admin');
    console.log('   - Normal User:');
    console.log('     Email: user@example.com');
    console.log('     Password: UserPass123');
    console.log('     Role: User');
    console.log('   - Manager User:');
    console.log('     Email: manager@example.com');
    console.log('     Password: ManagerPass123');
    console.log('     Role: Manager');
    console.log('   - Suspended User:');
    console.log('     Email: suspended@example.com');
    console.log('     Password: SuspendedPass123');
    console.log('     Role: User');
    console.log('');
    console.log('2. After signing up, run the seed script to create necessary data linked to these users.');

    console.log('');
    console.log('📄 Role Assignments:');
    console.log('   - Admin Role ID:', adminRoleFetched.id);
    console.log('   - User Role ID:', userRoleFetched.id);
    console.log('   - Manager Role ID:', managerRoleFetched.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
