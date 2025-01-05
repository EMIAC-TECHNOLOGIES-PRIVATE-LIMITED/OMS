
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read and parse the JSON file
    const jsonData = JSON.parse(
      await fs.readFile('vendors-data.json', 'utf-8')
    );

    // Find the table object with name 'tbl_vendors'
    const tableObj = jsonData.find(
      (obj) => obj.type === 'table' && obj.name === 'tbl_vendors'
    );

    if (!tableObj) {
      throw new Error("Table 'tbl_vendors' not found in JSON data.");
    }

    const vendorsData = tableObj.data;

    // Helper function to safely parse integers
    const parseSafeInt = (val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Process and insert each vendor
    for (const vendor of vendorsData) {
      try {
        await prisma.vendor.create({
          data: {
            name: vendor.name || '',
            phone: vendor.phone || '',
            email: vendor.email || '',
            contactedFrom: vendor.contacted_from || '',
            bankName: vendor.bank_name || vendor.vendor_bank_name || '',
            accountNumber: vendor.account_number || '',
            ifscCode: vendor.bank_ifsc || '',
            paypalId: vendor.paypal_id || '',
            userId: parseSafeInt(vendor.user_id),
            timestamp: vendor.timestamp || '',
            skypeId: vendor.skype_id || '',
            upiId: vendor.upi_id || '',
          },
        });
        console.log(`Successfully inserted vendor: ${vendor.name}`);
      } catch (vendorError) {
        console.error(
          `Error inserting vendor (ID: ${vendor.id}, Name: ${vendor.name}):`,
          vendorError
        );
      }
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
