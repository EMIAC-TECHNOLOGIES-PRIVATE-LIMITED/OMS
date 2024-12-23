import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read and parse the JSON file
    const jsonData = JSON.parse(
      await fs.readFile('sites-data.json', 'utf-8')
    );
    
    // Extract the sites data array
    const sitesData = jsonData[2].data;

    // Helper functions for data parsing
    const parseSafeDate = (dateStr) => {
      return dateStr && dateStr !== '0000-00-00' && dateStr !== '0000-00-00 00:00:00'
        ? new Date(dateStr)
        : new Date();
    };

    const parseSafeInt = (val) => val ? parseInt(val, 10) : null;
    const parseSafeBigInt = (val) => val ? BigInt(val) : BigInt(0);

    // Process and insert sites
    for (const site of sitesData) {
      try {
        await prisma.site.create({
          data: {
            id: parseInt(site.id),
            website: site.website,
            niche: site.niche || null,
            site_category: site.site_category === 'error' ? null : site.site_category,
            da: parseSafeInt(site.da),
            pa: parseSafeInt(site.pa),
            person: site.person,
            person_id: parseSafeInt(site.person_id),
            price: parseSafeInt(site.price),
            sailing_price: parseSafeInt(site.sailing_price),
            discount: parseSafeInt(site.discount),
            adult: parseSafeInt(site.adult),
            casino_adult: parseSafeInt(site.casino_adult),
            contact: site.contact,
            contact_from: site.contact_from,
            web_category: site.web_category,
            follow: site.follow || 'Do-follow',
            price_category: site.price_category,
            traffic: parseSafeBigInt(site.traffic),
            spam_score: parseSafeInt(site.spam_score),
            cbd_price: parseSafeInt(site.cbd_price),
            remark: site.remark,
            contact_from_id: site.contact_from_id,
            vendor_country: site.vendor_country,
            phone_number: site.phone_number ? BigInt(site.phone_number) : null,
            sample_url: site.sample_url,
            bank_details: site.bank_details,
            dr: parseSafeInt(site.dr),
            user_id: parseSafeInt(site.user_id),
            timestamp: parseSafeDate(site.timestamp),
            web_ip: site.web_ip,
            web_country: site.web_country,
            link_insertion_cost: site.link_insertion_cost,
            tat: site.tat,
            social_media_posting: site.social_media_posting,
            semrush_traffic: site.semrush_traffic ? BigInt(site.semrush_traffic) : BigInt(0),
            semrush_first_country_name: site.semrush_first_country_name,
            semrush_first_country_traffic: parseSafeBigInt(site.semrush_first_country_traffic),
            semrush_second_country_name: site.semrush_second_country_name,
            semrush_second_country_traffic: parseSafeBigInt(site.semrush_second_country_traffic),
            semrush_third_country_name: site.semrush_third_country_name,
            semrush_third_country_traffic: parseSafeBigInt(site.semrush_third_country_traffic),
            semrush_fourth_country_name: site.semrush_fourth_country_name,
            semrush_fourth_country_traffic: parseSafeBigInt(site.semrush_fourth_country_traffic),
            semrush_fifth_country_name: site.semrush_fifth_country_name,
            semrush_fifth_country_traffic: parseSafeBigInt(site.semrush_fifth_country_traffic),
            similarweb_traffic: parseSafeBigInt(site.similarweb_traffic),
            vendor_invoice_status: site.vendor_invoice_status,
            main_category: site.main_category,
            site_update_date: site.site_update_date,
            website_type: site.website_type,
            language: site.language,
            gst: site.gst,
            disclaimer: site.disclaimer,
            anchor_text: site.anchor_text,
            banner_image_price: parseSafeInt(site.banner_image_price),
            cp_update_date: parseSafeDate(site.cp_update_date),
            pure_category: site.pure_category,
            availability: site.availability,
            indexed_url: site.indexed_url,
            website_status: site.website_status,
            website_quality: site.website_quality,
            num_of_links: parseSafeInt(site.num_of_links),
            semrush_updation_date: parseSafeDate(site.semrush_updation_date),
            organic_traffic: parseSafeBigInt(site.organic_traffic),
            organic_traffic_last_update_date: parseSafeDate(site.organic_traffic_last_update_date),
            created_at: parseSafeDate(site.created_at)
          },
        });
        console.log(`Successfully inserted site: ${site.website}`);
      } catch (error) {
        console.error(`Error inserting site ${site.website}:`, error);
      }
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });