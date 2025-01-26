
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

    const parseSafeUnixTimestamp = (timestampStr) => {
      if (!timestampStr || timestampStr.includes('0000-00-00')) {
        return null;
      }
    
      const timestamp = parseInt(timestampStr, 10); // Convert to integer
      if (isNaN(timestamp)) {
        return null; // If not a valid number, return null
      }
    
      // Convert seconds to milliseconds for JavaScript Date
      const parsed = new Date(timestamp * 1000);
      return isNaN(parsed.getTime()) ? null : parsed;
    };
    

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
        // await prisma.vendor.create({
        //   data: {
        //     name: vendor.name || '',
        //     phone: vendor.phone || '',
        //     email: vendor.email || '',
        //     contactedFrom: vendor.contacted_from || '',
        //     bankName: vendor.bank_name || vendor.vendor_bank_name || '',
        //     accountNumber: vendor.account_number || '',
        //     ifscCode: vendor.bank_ifsc || '',
        //     paypalId: vendor.paypal_id || '',
        //     timestamp: parseSafeUnixTimestamp(vendor.timestamp),
        //     skypeId: vendor.skype_id || '',
        //     upiId: vendor.upi_id || '',
        //   },
        // });

        await prisma.vendor.update({
          where : {
            id: vendor.id
          }, 
          data : {
            user_id : vendor.user_id
          }
        })
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
