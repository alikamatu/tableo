import { PrismaClient, Plan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Owner user
  const owner = await prisma.user.upsert({
    where: { email: 'owner@tableo.dev' },
    update: {},
    create: {
      email: 'owner@tableo.dev',
      passwordHash: await bcrypt.hash('Password123!', 10),
      fullName: 'Demo Owner',
      phone: '+233200000000',
    },
  });

  // Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-001' },
    update: {},
    create: {
      id: 'seed-restaurant-001',
      ownerId: owner.id,
      name: 'Chow House',
      plan: Plan.pro,
      subStatus: 'active',
    },
  });

  // Branch
  const branch = await prisma.branch.upsert({
    where: { slug: 'chow-house-osu' },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Osu Branch',
      slug: 'chow-house-osu',
      address: 'Oxford Street, Osu, Accra',
      phone: '+233200000001',
    },
  });

  // Menu categories
  const starters = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Starters', sortOrder: 1 },
  });
  const mains = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Main Dishes', sortOrder: 2 },
  });
  const drinks = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Drinks', sortOrder: 3 },
  });

  // Menu items
  await prisma.menuItem.createMany({
    data: [
      { restaurantId: restaurant.id, categoryId: starters.id, name: 'Kelewele', description: 'Spiced fried plantain', basePrice: 25.0, sortOrder: 1 },
      { restaurantId: restaurant.id, categoryId: starters.id, name: 'Spring Rolls', description: 'Crispy veggie rolls', basePrice: 30.0, sortOrder: 2 },
      { restaurantId: restaurant.id, categoryId: mains.id, name: 'Jollof Rice & Chicken', description: 'Party jollof with grilled chicken', basePrice: 80.0, sortOrder: 1 },
      { restaurantId: restaurant.id, categoryId: mains.id, name: 'Waakye', description: 'Rice and beans with all sides', basePrice: 65.0, sortOrder: 2 },
      { restaurantId: restaurant.id, categoryId: mains.id, name: 'Grilled Tilapia', description: 'Whole tilapia, grilled to perfection', basePrice: 120.0, sortOrder: 3 },
      { restaurantId: restaurant.id, categoryId: drinks.id, name: 'Sobolo', description: 'Fresh hibiscus drink', basePrice: 15.0, sortOrder: 1 },
      { restaurantId: restaurant.id, categoryId: drinks.id, name: 'Cold Water', basePrice: 5.0, sortOrder: 2 },
    ],
  });

  console.log(`✅ Seeded restaurant: ${restaurant.name}`);
  console.log(`✅ Seeded branch: ${branch.name} → /menu/${branch.slug}`);
  console.log(`✅ Login: ${owner.email} / Password123!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
