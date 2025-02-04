import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Access Prisma's DMMF directly. Note that this is an undocumented API, so use with caution.
  const dmmf = (Prisma).dmmf;

  // Define the models to seed
  const modelsToSeed = ['Site', 'Vendor', 'Client', 'Order'];

  for (const modelName of modelsToSeed) {
    // Find the model definition in the DMMF
    const modelDef = dmmf.datamodel.models.find((m) => m.name === modelName);
    if (!modelDef) {
      console.error(`Model ${modelName} not found in the Prisma schema`);
      continue;
    }

    // Iterate over each field (first-level only)
    for (const field of modelDef.fields) {
      // Only include direct (first-level) columns: scalar or enum fields
      if (field.kind === 'scalar' || field.kind === 'enum') {
        let fieldType = field.kind === 'enum' ? `Enum(${field.type})` : field.type;
        if (!field.isRequired) {
          fieldType += '?';
        }
        if (field.isList) {
          fieldType += '[]';
        }

        // Construct the key in the format "ModelName.FieldName"
        const key = `${modelName}.${field.name}`;
        const description = fieldType;

        // Upsert the Resource record so that duplicate keys are not created
        await prisma.resource.upsert({
          where: { key },
          update: { description },
          create: { key, description },
        });

        console.log(`Seeded resource: ${key} - Description: ${description}`);
      }
    }
  }
}

main()
  .then(() => {
    console.log('Resource seeding completed successfully.');
  })
  .catch((error) => {
    console.error('Error during resource seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
