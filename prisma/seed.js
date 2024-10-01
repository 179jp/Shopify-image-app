import { PrismaClient } from "@prisma/client";
import { Patterns } from "./patterns.js";

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const DataPatterns = Patterns.map(pattern => {
    if(!pattern.name) {
      console.error('Pattern name is required', pattern);
      throw new Error('Pattern name is required');
    }
    const typeName = pattern.type === 'asa' ? '/麻' : '';
    return {
      name: pattern.name + typeName,
      num: pattern.designNo,
    }
  });
  
  const createMany = await prisma.color.createMany({
    data: DataPatterns,
  })
  
  console.log('Data seeding complete.');
}

main()
  .catch(err => {
    console.error('Error seeding data:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });