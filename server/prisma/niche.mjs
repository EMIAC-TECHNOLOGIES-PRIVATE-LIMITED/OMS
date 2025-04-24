
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const niche = [
    'Technology',
    'Health',
    'Finance',
    'Travel',
    'Food',
    'Lifestyle'
];

async function main() {
    // Get all sites
    const sites = await prisma.site.findMany();
    
    // Prepare all updates as a transaction
    const updates = sites.map(site => {
        const randomNiche = niche[Math.floor(Math.random() * niche.length)];
        return prisma.site.update({
            where: { id: site.id },
            data: { niche: randomNiche }
        });
    });
    
    const result = await prisma.$transaction(updates);
    
    console.log(`Updated ${result.length} sites with random niches!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
