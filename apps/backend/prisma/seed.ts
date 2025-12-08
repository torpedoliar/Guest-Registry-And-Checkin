import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  // Read admin credentials from environment or use defaults
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, passwordHash },
  });

  console.log('Seed completed:', { admin: admin.username });

  const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
  if (!activeEvent) {
    await prisma.event.create({
      data: {
        name: 'Default Event',
        isActive: true,
        date: new Date(),
        location: 'Default Location',
      },
    });
    console.log('Default active event created.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
