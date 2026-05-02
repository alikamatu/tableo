const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'chop-house';
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { branches: true }
  });

  if (restaurant) {
    console.log(`Restaurant found with slug "${slug}":`, restaurant.name);
    console.log('Branches:', restaurant.branches.map(b => ({ name: b.name, slug: b.slug, isActive: b.isActive })));
  } else {
    console.log(`Restaurant with slug "${slug}" NOT FOUND.`);
    const allRestaurants = await prisma.restaurant.findMany({ select: { name: true, slug: true } });
    console.log('Available restaurants:', allRestaurants);
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
