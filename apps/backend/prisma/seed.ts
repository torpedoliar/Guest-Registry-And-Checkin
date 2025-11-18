import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const password = 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash },
  });

  const event = await prisma.event.upsert({
    where: { id: 'seed-active-event' },
    update: { isActive: true, name: 'Sample Event' },
    create: {
      id: 'seed-active-event',
      name: 'Sample Event',
      location: 'Main Hall',
      isActive: true,
      backgroundType: 'NONE',
      overlayOpacity: 0.5,
    },
  });

  // Seed guests
  const guests = [
    { guestId: 'G001', name: 'John Doe', tableLocation: 'A1' },
    { guestId: 'G002', name: 'Jane Smith', tableLocation: 'B2' },
    { guestId: 'G003', name: 'Ahmad Fauzi', tableLocation: 'C3' },
  ];

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    await prisma.guest.upsert({
      where: { eventId_guestId: { eventId: event.id, guestId: g.guestId } },
      update: {},
      create: {
        queueNumber: i + 1,
        guestId: g.guestId,
        name: g.name,
        tableLocation: g.tableLocation,
        eventId: event.id,
      },
    });
  }

  console.log('Seed completed:', { admin: admin.username, event: event.name });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
