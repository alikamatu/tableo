const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resolveMenuForSlug(slug) {
    let branch = await prisma.branch.findUnique({
      where: { slug },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            paystackPublicKey: true,
            paystackSubaccountCode: true,
            currency: true,
            address: true,
          },
        },
      },
    });

    console.log('Initial branch find:', branch ? 'FOUND' : 'NOT FOUND');

    // Fallback: allow restaurant slug too, use first active branch.
    if (!branch) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true },
      });
      console.log('Restaurant find:', restaurant ? 'FOUND' : 'NOT FOUND');
      if (restaurant) {
        branch = await prisma.branch.findFirst({
          where: { restaurantId: restaurant.id, isActive: true },
          orderBy: { createdAt: 'asc' },
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                paystackPublicKey: true,
                paystackSubaccountCode: true,
                currency: true,
                address: true,
              },
            },
          },
        });
        console.log('Fallback branch find:', branch ? 'FOUND' : 'NOT FOUND');
      }
    }

    if (!branch || !branch.isActive) {
        console.log('Final check: FAILED');
        return null;
    }
    console.log('Final check: SUCCESS');
    return branch;
}

async function main() {
  const slug = 'chop-house';
  await resolveMenuForSlug(slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
