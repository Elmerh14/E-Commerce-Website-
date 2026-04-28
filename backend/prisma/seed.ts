import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Seeding database...')

  // ─── Users ────────────────────────────────────────────────────────────────

  const passhash = await bcrypt.hash('password123', 12)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', passhash, username: 'alice' },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', passhash, username: 'bob' },
  })

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos@example.com' },
    update: {},
    create: { email: 'carlos@example.com', passhash, username: 'carlos' },
  })

  // ─── Listings ─────────────────────────────────────────────────────────────

  const camera = await prisma.listing.create({
    data: {
      userId: alice.id,
      type: 'SELL',
      title: 'Vintage Film Camera',
      category: 'Electronics',
      condition: 'GOOD',
      description: 'Classic 35mm film camera in great working condition. Comes with original strap and 50mm lens.',
      location: 'Austin, TX',
      price: 85,
    },
  })

  const books = await prisma.listing.create({
    data: {
      userId: alice.id,
      type: 'BARTER',
      title: 'Programming Books Collection',
      category: 'Books',
      condition: 'GOOD',
      description: 'Set of 8 programming books including Clean Code, SICP, and The Pragmatic Programmer. Open to trade for tech gear.',
      location: 'Austin, TX',
      price: null,
    },
  })

  const bike = await prisma.listing.create({
    data: {
      userId: alice.id,
      type: 'BOTH',
      title: 'Trek Mountain Bike',
      category: 'Sports',
      condition: 'LIKE_NEW',
      description: 'Trek Marlin 5 mountain bike, barely ridden. 21-speed, 29-inch wheels, hydraulic disc brakes.',
      location: 'Austin, TX',
      price: 350,
    },
  })

  const jacket = await prisma.listing.create({
    data: {
      userId: bob.id,
      type: 'SELL',
      title: 'Vintage Denim Jacket',
      category: 'Clothing',
      condition: 'GOOD',
      description: "1990s Levi's trucker jacket, size M. Faded wash with classic fit. Some light wear on cuffs.",
      location: 'Denver, CO',
      price: 45,
    },
  })

  const pottery = await prisma.listing.create({
    data: {
      userId: bob.id,
      type: 'BARTER',
      title: 'Hand-Crafted Pottery Set',
      category: 'Home',
      condition: 'NEW',
      description: 'Set of 4 hand-thrown ceramic mugs. Food safe glaze, dishwasher safe. Trade for anything interesting.',
      location: 'Denver, CO',
      price: null,
    },
  })

  const console = await prisma.listing.create({
    data: {
      userId: bob.id,
      type: 'BOTH',
      title: 'Gaming Console Bundle',
      category: 'Electronics',
      condition: 'GOOD',
      description: 'PS5 with two controllers, charging dock, and 5 games. Works perfectly, selling because I upgraded.',
      location: 'Denver, CO',
      price: 200,
    },
  })

  const desk = await prisma.listing.create({
    data: {
      userId: carlos.id,
      type: 'SELL',
      title: 'Mid-Century Modern Desk',
      category: 'Furniture',
      condition: 'GOOD',
      description: 'Solid walnut desk with tapered legs and two drawers. 54 inches wide. Local pickup only.',
      location: 'Chicago, IL',
      price: 120,
    },
  })

  const guitar = await prisma.listing.create({
    data: {
      userId: carlos.id,
      type: 'BARTER',
      title: 'Acoustic Guitar',
      category: 'Music',
      condition: 'FAIR',
      description: 'Yamaha FG800 acoustic guitar. Plays well, has a small scratch on the body. Trade for other instruments or gear.',
      location: 'Chicago, IL',
      price: null,
    },
  })

  await prisma.listing.create({
    data: {
      userId: carlos.id,
      type: 'SELL',
      title: 'Mechanical Keyboard',
      category: 'Electronics',
      condition: 'LIKE_NEW',
      description: 'Keychron K2 with Brown switches. Used for 3 months, includes extra keycap set.',
      location: 'Chicago, IL',
      price: 95,
    },
  })

  await prisma.listing.create({
    data: {
      userId: alice.id,
      type: 'BOTH',
      title: 'LEGO Star Wars Millennium Falcon',
      category: 'Toys',
      condition: 'NEW',
      description: 'Sealed in box, never opened. 7,541 pieces. Retired set, great investment or gift.',
      location: 'Austin, TX',
      price: 150,
    },
  })

  // ─── Listing Images ────────────────────────────────────────────────────────

  await prisma.listingImage.createMany({
    data: [
      { listingId: camera.id, imageUrl: 'https://placehold.co/800x600/png', sortOrder: 0 },
      { listingId: camera.id, imageUrl: 'https://placehold.co/800x600/png', sortOrder: 1 },
      { listingId: bike.id,   imageUrl: 'https://placehold.co/800x600/png', sortOrder: 0 },
      { listingId: console.id, imageUrl: 'https://placehold.co/800x600/png', sortOrder: 0 },
      { listingId: desk.id,   imageUrl: 'https://placehold.co/800x600/png', sortOrder: 0 },
    ],
  })

  // ─── Conversations ────────────────────────────────────────────────────────

  const convo1 = await prisma.conversation.create({
    data: { listingId: camera.id, buyerId: bob.id, sellerId: alice.id },
  })

  const convo2 = await prisma.conversation.create({
    data: { listingId: console.id, buyerId: carlos.id, sellerId: bob.id },
  })

  // ─── Messages ─────────────────────────────────────────────────────────────

  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, senderId: bob.id,   body: 'Hey! Is the camera still available?', isRead: true },
      { conversationId: convo1.id, senderId: alice.id, body: 'Yes it is! Just cleaned the lens too.', isRead: false },
      { conversationId: convo2.id, senderId: carlos.id, body: 'Would you take $175 for the console?', isRead: false },
    ],
  })

  await prisma.conversation.update({
    where: { id: convo1.id },
    data: { lastMessageAt: new Date() },
  })

  await prisma.conversation.update({
    where: { id: convo2.id },
    data: { lastMessageAt: new Date() },
  })

  console.log('\nDone! Test credentials:')
  console.log('  alice@example.com / password123')
  console.log('  bob@example.com   / password123')
  console.log('  carlos@example.com / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
