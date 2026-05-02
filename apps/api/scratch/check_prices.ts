import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  const orders = await prisma.order.findMany({
    include: { orderItems: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- LATEST ORDERS ---');
  orders.forEach((o) => {
    console.log(`Order #${o.orderNumber} (${o.id}): Total=${o.total}`);
    o.orderItems.forEach((i) => {
      console.log(`  - Item: ${i.nameSnapshot}, Price=${i.unitPrice}, Qty=${i.quantity}`);
    });
  });
}

checkOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
