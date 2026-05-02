const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'chop-house';
  const branch = await prisma.branch.findUnique({
    where: { slug },
  });

  if (!branch) {
    console.log(`Branch with slug "${slug}" NOT FOUND.`);
    // Let's see what branches exist
    const allBranches = await prisma.branch.findMany({
        select: { name: true, slug: true, isActive: true }
    });
    console.log('Available branches:', allBranches);
  } else {
    console.log(`Branch found:`, branch);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
