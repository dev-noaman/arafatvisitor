import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

function mapLocation(loc: string | undefined): 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' | null {
  if (!loc) return null;
  const s = loc.toLowerCase();
  if (s.includes('barwa')) return 'BARWA_TOWERS';
  if (s.includes('marina') && s.includes('50')) return 'MARINA_50';
  if (s.includes('element') || s.includes('mariott')) return 'ELEMENT_MARIOTT';
  return null;
}

async function seedUsers() {
  const csvPath = path.join(__dirname, '../../Adel Data/users-export.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('Users CSV file not found, skipping user import');
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Array<{
    id?: string;
    Name?: string;
    Email?: string;
    password?: string;
    Role?: string;
  }>;

  let imported = 0;
  let skipped = 0;
  let existing = 0;

  for (const row of records) {
    const idStr = row.id?.trim();
    const email = row.Email?.trim();
    const name = row.Name?.trim();
    const password = row.password?.trim();
    const roleString = row.Role?.trim() as any;

    // Skip rows without required fields
    if (!email || !name) {
      skipped++;
      continue;
    }

    // Parse numeric ID from CSV
    const id = idStr ? parseInt(idStr, 10) : null;
    if (!id || isNaN(id)) {
      skipped++;
      console.log(`Skipping user without valid ID: ${email}`);
      continue;
    }

    // Check if user with this ID already exists - skip if so
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (existingUser) {
      existing++;
      console.log(`Skipping existing user (ID: ${id}): ${existingUser.email}`);
      continue;
    }

    // Also check if email already exists (to avoid duplicate email error)
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      existing++;
      console.log(`Skipping user - email already exists: ${email}`);
      continue;
    }

    // Map role string to Role enum, default to RECEPTION
    const role = ['ADMIN', 'RECEPTION', 'HOST'].includes(roleString)
      ? (roleString as 'ADMIN' | 'RECEPTION' | 'HOST')
      : 'RECEPTION';

    // Use default password if not provided
    const rawPassword = password || 'changeme123';
    const hash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

    // Create user with specific ID from CSV
    await prisma.user.create({
      data: {
        id,
        email,
        name,
        password: hash,
        role,
      },
    });

    imported++;
    console.log(`Added new user (ID: ${id}): ${email} (${role})`);
  }

  console.log(`Users: ${imported} imported, ${existing} existing, ${skipped} skipped`);
}

async function seedHostsFromCsv() {
  const csvPath = path.join(__dirname, '../../Adel Data/members-28-01-2026-T0941.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('CSV file not found, skipping host import');
    return;
  }
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Array<{
    Name?: string;
    Company?: string;
    'Email Address'?: string;
    'Phone Number'?: string;
    Location?: string;
    Status?: string;
    ID?: string;
  }>;

  let imported = 0;
  let existingCount = 0;
  let errorCount = 0;
  let invalidCount = 0;
  const invalidRows: any[] = [];

  for (const row of records) {
    const name = row.Name?.trim();
    const company = row.Company?.trim();
    const phoneStr = (row['Phone Number'] ?? '').toString().replace(/^\+/, '').trim();
    const phone = phoneStr.length > 0 ? phoneStr : null;
    const email = row['Email Address']?.trim();

    // Updated validation: email is required, phone is optional
    if (!name || !company || !email) {
      invalidCount++;
      invalidRows.push({ ...row, Reason: 'Missing Name, Company, or Email' });
      continue;
    }
    const externalId = row.ID?.trim();

    const location = mapLocation(row.Location);
    const status = (row.Status ?? '').toLowerCase() === 'active' ? 1 : 0;
    const hostData = {
      name: name.substring(0, 100),
      company: company.substring(0, 100),
      email: email.substring(0, 100),
      phone: phone ? phone.substring(0, 191) : null,
      location,
      status,
      externalId: externalId || undefined,
    };

    try {
      // Check if host already exists by externalId (unique ID from CSV)
      if (externalId) {
        const existingHost = await prisma.host.findUnique({ where: { externalId } });
        if (existingHost) {
          // Skip existing hosts - don't update them
          existingCount++;
          console.log(`Skipping existing host (ID: ${externalId}): ${name}`);
          continue;
        }
      }

      // Only create new hosts
      await prisma.host.create({ data: hostData });
      imported++;
      console.log(`Added new host: ${name} (ID: ${externalId || 'none'})`);
    } catch (e) {
      console.error(`Error importing ${name} (${email}):`, e);
      errorCount++;
      invalidRows.push({ ...row, Reason: `Db Error: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  if (invalidRows.length > 0) {
    const header = Object.keys(invalidRows[0]).join(',') + '\n';
    const rows = invalidRows.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const outPath = path.join(__dirname, '../../Adel Data/invalid_hosts.csv');
    fs.writeFileSync(outPath, header + rows);
    console.log(`Wrote ${invalidRows.length} invalid records to ${outPath}`);
  }

  console.log(`Hosts: ${imported} imported, ${existingCount} existing, ${invalidCount} invalid data, ${errorCount} errors`);
}

async function seedPreRegistersByReception() {
  console.log('Seeding Pre-Registers by Reception...');

  // Find a reception user
  const reception = await prisma.user.findFirst({
    where: { role: 'RECEPTION' }
  });

  if (!reception) {
    console.log('No reception user found for seeding pre-registers');
    return;
  }

  // Find a host
  const host = await prisma.host.findFirst({
    where: { status: 1 }
  });

  if (!host) {
    console.log('No active host found for seeding pre-registers');
    return;
  }

  // Create 5 pre-registered visits
  for (let i = 0; i < 5; i++) {
    await prisma.visit.create({
      data: {
        sessionId: randomUUID(),
        visitorName: `PreReg Visitor ${i + 1}`,
        visitorCompany: 'Test Corp',
        visitorPhone: `+123456789${i}`,
        visitorEmail: `prereg${i}@example.com`,
        purpose: 'Meeting',
        location: 'BARWA_TOWERS',
        status: 'PRE_REGISTERED',
        hostId: host.id,
        preRegisteredById: reception.id.toString(),
        expectedDate: new Date(),
      }
    });
  }
  console.log('Created 5 pre-registered visits by reception');
}

async function seedVisitorsByHost() {
  console.log('Seeding Visitors by Host...');

  const host = await prisma.host.findFirst({
    where: { status: 1 }
  });

  if (!host) {
    console.log('No active host found for seeding visitors');
    return;
  }

  const statuses: ('PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT')[] = [
    'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT',
    'PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN', 'CHECKED_IN', 'CHECKED_OUT'
  ];

  for (let i = 0; i < 10; i++) {
    const status = statuses[i];
    await prisma.visit.create({
      data: {
        sessionId: randomUUID(),
        visitorName: `Host Visitor ${i + 1}`,
        visitorCompany: 'Partner Inc',
        visitorPhone: `+987654321${i}`,
        visitorEmail: `hostvis${i}@example.com`,
        purpose: 'Site Visit',
        location: 'MARINA_50',
        status: status,
        hostId: host.id,
        expectedDate: new Date(),
        // Add specific timestamps based on status
        approvedAt: ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT'].includes(status) ? new Date() : undefined,
        checkInAt: ['CHECKED_IN', 'CHECKED_OUT'].includes(status) ? new Date() : undefined,
        checkOutAt: status === 'CHECKED_OUT' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
      }
    });
  }
  console.log('Created 10 visitors by host with different statuses');
}

async function seedDeliveries() {
  console.log('Seeding Deliveries...');

  const host = await prisma.host.findFirst({
    where: { status: 1 }
  });

  for (let i = 0; i < 10; i++) {
    const isPickedUp = i % 2 === 0;
    await prisma.delivery.create({
      data: {
        recipient: host ? host.name : 'General Recipient',
        hostId: host ? host.id : undefined,
        courier: `Courier Service ${i + 1}`,
        location: 'ELEMENT_MARIOTT',
        status: isPickedUp ? 'PICKED_UP' : 'RECEIVED',
        notes: `Package #${i + 1}`,
        receivedAt: new Date(),
        pickedUpAt: isPickedUp ? new Date() : undefined,
      }
    });
  }
  console.log('Created 10 deliveries with different statuses');
}

async function main() {
  await seedUsers();
  await seedHostsFromCsv();
  await seedPreRegistersByReception();
  await seedVisitorsByHost();
  await seedDeliveries();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
