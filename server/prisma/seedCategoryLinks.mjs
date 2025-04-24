import { PrismaClient } from '@prisma/client';
// Initialize Prisma Client
const prisma = new PrismaClient();

// Dummy data generation helpers
const domains = [
  'example.com', 'testsite.org', 'mysite.net', 'webpage.io', 'blogspot.com',
  'techhub.dev', 'newsroom.co', 'shoponline.store', 'learning.edu', 'portfolio.me'
];

const categories = [
  'technology', 'news', 'shopping', 'education', 'health',
  'finance', 'travel', 'food', 'sports', 'entertainment'
];

function generateRandomEntry(index) {
  const site = domains[index % domains.length]; // Cycle through domains
  const category = categories[Math.floor(Math.random() * categories.length)]; // Random category
  const siteId = 1000 + index; // Arbitrary siteId starting from 1000
  const categoryLink = `https://${site}/category/${category}/${Math.random().toString(36).substring(7)}`; // Unique link

  return {
    siteId,
    site,
    category,
    categoryLink,
  };
}

// Function to seed the database
async function seedDatabase() {
  try {
    // Generate 50 unique entries
    const entries = [];
    for (let i = 0; i < 50; i++) {
      const entry = generateRandomEntry(i);
      // Ensure uniqueness for [site, category]
      const isDuplicate = entries.some(
        (e) => e.site === entry.site && e.category === entry.category
      );
      if (!isDuplicate) {
        entries.push(entry);
      } else {
        // If duplicate, adjust category and retry
        const newCategory = categories[(categories.indexOf(entry.category) + 1) % categories.length];
        entries.push({
          ...entry,
          category: newCategory,
          categoryLink: `https://${entry.site}/category/${newCategory}/${Math.random().toString(36).substring(7)}`,
        });
      }
    }

    // Insert into database
    const createdEntries = await prisma.categoryLinks.createMany({
      data: entries,
      skipDuplicates: true, // Skip any accidental duplicates
    });

    console.log(`Successfully inserted ${createdEntries.count} dummy entries into CategoryLinks table.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDatabase();