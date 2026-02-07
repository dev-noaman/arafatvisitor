import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding production admin user...');

  const email = 'admin@arafatvisitor.cloud';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
  await prisma.user.create({
    data: {
      id: 999001,
      email,
      name: 'Admin',
      password: hash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`Created admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
