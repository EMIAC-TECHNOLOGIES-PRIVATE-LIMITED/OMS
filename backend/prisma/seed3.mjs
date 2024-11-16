// seed2.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Enum mappings based on Prisma schema
const NicheEnum = {
  MULTI: 'Multi',
  TECH: 'Tech',
  BUSINESS: 'Business',
  ENTERTAINMENT: 'Entertainment',
  TRAVEL: 'Travel'
};

const SiteCategoryEnum = {
  FASHION_AND_BEAUTY: 'FashionAndBeauty',
  FITNESS_AND_SPORTS: 'FitnessAndSports',
  GENERAL_NEWS: 'GeneralNews',
  HEALTH: 'Health',
  TECH_UPDATES: 'TechUpdates',
  FINANCE: 'Finance',
  TRAVEL: 'Travel',
  EDUCATION: 'Education',
  ENTERTAINMENT: 'Entertainment',
  LIFESTYLE: 'Lifestyle'
};

const ContactFromEnum = {
  CARE_OUTREACHDEAL: 'Care@Outreachdeal.Com',
  RISHI_EKLAVYA: 'Rishijhangir@gmail.com,eklavyagupta121@gmail.com',
  VENDOR_OUTREACHDEAL: 'Vendor@Outreachdeal.Com'
};

const FollowEnum = {
  DO_FOLLOW: 'Do-follow',
  NO_FOLLOW: 'No-follow',
  SPONSORED: 'Sponsored'
};

const PriceTypeEnum = {
  PAID: 'Paid',
  FREE: 'Free',
  EXCHANGE: 'Exchange'
};

const PostingEnum = {
  YES: 'Yes',
  NO: 'No'
};

const VendorInvoiceStatusEnum = {
  PENDING: 'Pending',
  ASK: 'Ask',
  RECEIVED: 'Received',
  GIVEN: 'Given',
  PAID: 'Paid'
};

const WebsiteTypeEnum = {
  DEFAULT: 'Default',
  PR: 'PR',
  LANGUAGE: 'Language'
};

const WebsiteStatusEnum = {
  NORMAL: 'Normal',
  BLACKLIST: 'Blacklist',
  DISQUALIFIED: 'Disqualified'
};

const WebsiteQualityEnum = {
  PURE: 'Pure',
  ALMOST_PURE: 'Almost_Pure',
  MULTI: 'Multi'
};

// Function to map string values to exact Prisma enum values
const mapToEnum = (value, enumMap, defaultValue = null) => {
  if (!value) return defaultValue;

  // Split by comma and take the first non-empty trimmed value
  const values = value.split(',').map(v => v.trim());

  for (const val of values) {
    const standardizedValue = val.replace(/[\s-]+/g, '_').toUpperCase();
    if (enumMap[standardizedValue]) {
      return enumMap[standardizedValue];
    }
  }

  console.warn(`Warning: No matching enum found for value "${value}". Using default value "${defaultValue}".`);
  return defaultValue;
};

// Function to ensure users exist
const ensureUserExists = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // Create a default user or fetch from another data source
    // Here, we'll create a placeholder user. Adjust as needed.
    await prisma.user.create({
      data: {
        id: userId,
        // Add other required fields for User
        // Example:
        // name: `User${userId}`,
        // email: `user${userId}@example.com`,
      },
    });
    console.log(`Created placeholder user with id ${userId}`);
  }
};

// Seeding script
async function main() {
  try {
    const jsonData = JSON.parse(
      await fs.readFile('updated_sites-data.json', 'utf-8')
    );

    const tableEntry = jsonData.find(entry => entry.type === 'table' && entry.name === 'tbl_sites');
    if (!tableEntry) {
      throw new Error('tbl_sites table not found in JSON data.');
    }

    const sitesData = tableEntry.data;

    // Ensure all referenced users exist
    const uniqueUserIds = [...new Set(sitesData.map(site => parseInt(site.user_id, 10)))];
    for (const userId of uniqueUserIds) {
      await ensureUserExists(userId);
    }

    // Utility function to validate dates
    const isValidDate = (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && dateString !== '0000-00-00' && dateString !== '0000-00-00 00:00:00';
    };

    // Safe parsing functions
    const parseSafeDate = (dateStr) => {
      return isValidDate(dateStr) ? new Date(dateStr) : null;
    };

    const parseSafeInt = (val) => val && val !== '' ? parseInt(val, 10) : null;
    const parseSafeBigInt = (val) => val && val !== '' ? BigInt(val) : BigInt(0);

    for (const site of sitesData) {
      try {
        // Transform and map enum fields
        const transformedSite = {
          id: parseSafeInt(site.id),
          website: site.website,
          niche: mapToEnum(site.niche, NicheEnum, null),
          site_category: mapToEnum(site.site_category, SiteCategoryEnum, null),
          da: parseSafeInt(site.da),
          pa: parseSafeInt(site.pa),
          person: site.person || null, // Handle empty strings
          person_id: parseSafeInt(site.person_id),
          price: parseSafeInt(site.price),
          sailing_price: parseSafeInt(site.sailing_price),
          discount: parseSafeInt(site.discount),
          adult: parseSafeInt(site.adult),
          casino_adult: parseSafeInt(site.casino_adult),
          contact: site.contact || null,
          contact_from: mapToEnum(site.contact_from, ContactFromEnum, null),
          web_category: site.web_category || null,
          follow: mapToEnum(site.follow, FollowEnum, 'Do-follow'),
          price_category: mapToEnum(site.price_category, PriceTypeEnum, 'Paid'),
          traffic: parseSafeBigInt(site.traffic),
          spam_score: parseSafeInt(site.spam_score),
          cbd_price: parseSafeInt(site.cbd_price),
          remark: site.remark || null,
          contact_from_id: site.contact_from_id || null,
          vendor_country: site.vendor_country || null,
          phone_number: site.phone_number && site.phone_number !== '0' ? BigInt(site.phone_number) : null,
          sample_url: site.sample_url || null,
          bank_details: site.bank_details || null,
          dr: parseSafeInt(site.dr),
          user_id: parseSafeInt(site.user_id),
          timestamp: parseSafeDate(site.timestamp) || new Date(), // Default to current date if invalid
          web_ip: site.web_ip || null,
          web_country: site.web_country || null,
          link_insertion_cost: site.link_insertion_cost || null,
          tat: site.tat || null,
          social_media_posting: mapToEnum(site.social_media_posting, PostingEnum, 'No'),
          semrush_traffic: parseSafeBigInt(site.semrush_traffic),
          semrush_first_country_name: site.semrush_first_country_name || null,
          semrush_first_country_traffic: parseSafeBigInt(site.semrush_first_country_traffic),
          semrush_second_country_name: site.semrush_second_country_name || null,
          semrush_second_country_traffic: parseSafeBigInt(site.semrush_second_country_traffic),
          semrush_third_country_name: site.semrush_third_country_name || null,
          semrush_third_country_traffic: parseSafeBigInt(site.semrush_third_country_traffic),
          semrush_fourth_country_name: site.semrush_fourth_country_name || null,
          semrush_fourth_country_traffic: parseSafeBigInt(site.semrush_fourth_country_traffic),
          semrush_fifth_country_name: site.semrush_fifth_country_name || null,
          semrush_fifth_country_traffic: parseSafeBigInt(site.semrush_fifth_country_traffic),
          similarweb_traffic: parseSafeBigInt(site.similarweb_traffic),
          vendor_invoice_status: mapToEnum(site.vendor_invoice_status, VendorInvoiceStatusEnum, 'Pending'),
          main_category: site.main_category || null,
          site_update_date: site.site_update_date || null,
          website_type: mapToEnum(site.website_type, WebsiteTypeEnum, 'Default'),
          language: site.language || null,
          gst: site.gst || null,
          disclaimer: site.disclaimer || null,
          anchor_text: site.anchor_text || null,
          banner_image_price: parseSafeInt(site.banner_image_price),
          cp_update_date: parseSafeDate(site.cp_update_date),
          pure_category: site.pure_category || null,
          availability: site.availability || null,
          indexed_url: site.indexed_url || null,
          website_status: mapToEnum(site.website_status, WebsiteStatusEnum, 'Normal'),
          website_quality: mapToEnum(site.website_quality, WebsiteQualityEnum, null),
          num_of_links: parseSafeInt(site.num_of_links),
          semrush_updation_date: parseSafeDate(site.semrush_updation_date),
          organic_traffic: parseSafeBigInt(site.organic_traffic),
          organic_traffic_last_update_date: parseSafeDate(site.organic_traffic_last_update_date),
          created_at: parseSafeDate(site.created_at) || new Date(), // Default to current date if invalid
          // Establishing the relation to User
          user: {
            connect: { id: parseSafeInt(site.user_id) },
          },
        };

        // Remove any undefined fields (optional)
        Object.keys(transformedSite).forEach(key => {
          if (transformedSite[key] === undefined) {
            delete transformedSite[key];
          }
        });

        await prisma.site.create({
          data: transformedSite,
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
