import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// Test data constants - all test seeds use these
const TEST_PHONE = '+97450707317';
const TEST_EMAIL = 'adel.noaman@arafatgroup.com';

// Clear existing test data before seeding to avoid duplicates
async function clearTestData() {
  console.log('Clearing existing test data...');

  // Delete test visitors (by test phone number)
  const deletedVisits = await prisma.visit.deleteMany({
    where: { visitorPhone: TEST_PHONE }
  });
  console.log(`Deleted ${deletedVisits.count} test visits`);

  // Delete test hosts (by externalId starting with TEST-)
  const deletedHosts = await prisma.host.deleteMany({
    where: { externalId: { startsWith: 'TEST-' } }
  });
  console.log(`Deleted ${deletedHosts.count} test hosts`);

  console.log('Test data cleared successfully');
}

function mapLocation(loc: string | undefined): 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' | null {
  if (!loc) return null;
  const s = loc.toLowerCase();
  if (s.includes('barwa')) return 'BARWA_TOWERS';
  if (s.includes('marina') && s.includes('50')) return 'MARINA_50';
  if (s.includes('element') || s.includes('mariott')) return 'ELEMENT_MARIOTT';
  return null;
}

// Default test users for quick login (matches frontend LoginForm.tsx)
// Use high IDs (999001-999003) to avoid conflicts with CSV imports
const DEFAULT_USERS = [
  { id: 999001, email: 'admin@arafatvisitor.cloud', password: 'admin123', name: 'Admin User', role: 'ADMIN' as const },
  { id: 999002, email: 'gm@arafatvisitor.cloud', password: 'gm123', name: 'General Manager', role: 'ADMIN' as const },
  { id: 999003, email: 'reception@arafatvisitor.cloud', password: 'reception123', name: 'Reception User', role: 'RECEPTION' as const },
];

async function seedDefaultUsers() {
  console.log('Seeding default test users...');
  let created = 0;
  let existing = 0;

  for (const user of DEFAULT_USERS) {
    // Check by email (more reliable than ID)
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (existingUser) {
      existing++;
      console.log(`Default user already exists: ${user.email}`);
      continue;
    }

    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hash,
        role: user.role,
      },
    });
    created++;
    console.log(`Created default user: ${user.email} (${user.role})`);
  }

  console.log(`Default users: ${created} created, ${existing} already existed`);
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
    const roleString = row.Role?.trim() as string | undefined;

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
  const invalidRows: Record<string, unknown>[] = [];

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

// Generate a simple QR token
function generateQrToken(): string {
  return `QR-${randomUUID().substring(0, 8).toUpperCase()}`;
}

async function seedTestHosts() {
  console.log('Seeding 10 test hosts...');

  const testHosts = [
    { name: 'Ahmed Al-Rashid', company: 'Qatar Petroleum', email: TEST_EMAIL, phone: TEST_PHONE, location: 'BARWA_TOWERS' as const },
    { name: 'Sarah Johnson', company: 'Ooredoo Qatar', email: TEST_EMAIL, phone: TEST_PHONE, location: 'MARINA_50' as const },
    { name: 'Mohammed Hassan', company: 'Qatar Airways', email: TEST_EMAIL, phone: TEST_PHONE, location: 'ELEMENT_MARIOTT' as const },
    { name: 'Fatima Al-Thani', company: 'QNB Group', email: TEST_EMAIL, phone: TEST_PHONE, location: 'BARWA_TOWERS' as const },
    { name: 'John Smith', company: 'Ashghal', email: TEST_EMAIL, phone: TEST_PHONE, location: 'MARINA_50' as const },
    { name: 'Noura Al-Sulaiti', company: 'Vodafone Qatar', email: TEST_EMAIL, phone: TEST_PHONE, location: 'ELEMENT_MARIOTT' as const },
    { name: 'David Wilson', company: 'Qatar Foundation', email: TEST_EMAIL, phone: TEST_PHONE, location: 'BARWA_TOWERS' as const },
    { name: 'Maryam Al-Kuwari', company: 'Katara Hospitality', email: TEST_EMAIL, phone: TEST_PHONE, location: 'MARINA_50' as const },
    { name: 'Khalid Ibrahim', company: 'Qatar Energy', email: TEST_EMAIL, phone: TEST_PHONE, location: 'ELEMENT_MARIOTT' as const },
    { name: 'Lisa Brown', company: 'Hamad Medical Corp', email: TEST_EMAIL, phone: TEST_PHONE, location: 'BARWA_TOWERS' as const },
  ];

  const createdHosts: { id: bigint; name: string; location: 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' }[] = [];

  for (const hostData of testHosts) {
    // Check by name since all test hosts use same email
    const existing = await prisma.host.findFirst({
      where: { name: hostData.name, externalId: { startsWith: 'TEST-' } }
    });
    if (existing) {
      console.log(`Test host already exists: ${hostData.name}`);
      createdHosts.push({ id: existing.id, name: existing.name, location: existing.location || 'BARWA_TOWERS' });
      continue;
    }

    const host = await prisma.host.create({
      data: {
        name: hostData.name,
        company: hostData.company,
        email: hostData.email,
        phone: hostData.phone,
        location: hostData.location,
        status: 1,
        externalId: `TEST-${randomUUID().substring(0, 8).toUpperCase()}`,
      }
    });
    createdHosts.push({ id: host.id, name: host.name, location: host.location || 'BARWA_TOWERS' });
    console.log(`Created test host: ${hostData.name}`);
  }

  console.log(`Created/found ${createdHosts.length} test hosts`);
  return createdHosts;
}

async function seedTestDeliveries(hosts: { id: bigint; name: string; location: 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' }[]) {
  console.log('Seeding test deliveries...');

  const couriers = ['DHL', 'FedEx', 'Aramex', 'Qatar Post', 'UPS', 'TNT Express'];
  let created = 0;

  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i];
    const courier = couriers[i % couriers.length];

    // Check if delivery already exists for this host
    const existing = await prisma.delivery.findFirst({
      where: {
        hostId: host.id,
        recipient: host.name,
        courier: courier
      }
    });

    if (existing) {
      console.log(`Delivery already exists for host: ${host.name}`);
      continue;
    }

    await prisma.delivery.create({
      data: {
        recipient: host.name,
        hostId: host.id,
        courier: courier,
        location: host.location,
        status: i % 3 === 0 ? 'PICKED_UP' : 'RECEIVED',
        notes: `Package #${1000 + i} - ${i % 2 === 0 ? 'Documents' : 'Electronics'}`,
        receivedAt: new Date(),
        pickedUpAt: i % 3 === 0 ? new Date() : undefined,
      }
    });
    created++;
    console.log(`Created delivery for: ${host.name} via ${courier}`);
  }

  console.log(`Created ${created} test deliveries`);
}

async function seedTestVisitorsWithQr(hosts: { id: bigint; name: string; location: 'BARWA_TOWERS' | 'MARINA_50' | 'ELEMENT_MARIOTT' }[]) {
  console.log('Seeding test visitors with QR codes...');

  // Visitors for Pre Register panel (PRE_REGISTERED, PENDING_APPROVAL, APPROVED, REJECTED)
  const preRegVisitors = [
    { name: 'Michael Chen', status: 'PRE_REGISTERED' as const },
    { name: 'Aisha Al-Mahmoud', status: 'PENDING_APPROVAL' as const },
    { name: 'Robert Garcia', status: 'APPROVED' as const },
    { name: 'Huda Al-Baker', status: 'REJECTED' as const },
    { name: 'James Wilson', status: 'PRE_REGISTERED' as const },
  ];

  // Visitors for Visitors panel (CHECKED_IN, CHECKED_OUT)
  const checkedInVisitors = [
    { name: 'Layla Hassan', status: 'CHECKED_IN' as const },
    { name: 'Thomas Anderson', status: 'CHECKED_IN' as const },
    { name: 'Reem Al-Naimi', status: 'CHECKED_OUT' as const },
    { name: 'Daniel Lee', status: 'CHECKED_IN' as const },
    { name: 'Salma Youssef', status: 'CHECKED_OUT' as const },
  ];

  const allVisitors = [...preRegVisitors, ...checkedInVisitors];

  const purposes = ['Business Meeting', 'Interview', 'Contractor Visit', 'Client Presentation', 'Audit',
                    'Consultation', 'Site Inspection', 'Training', 'Board Meeting', 'Partnership Discussion'];

  const createdVisits: { id: string; visitorName: string; token: string; status: string }[] = [];

  for (let i = 0; i < allVisitors.length; i++) {
    const host = hosts[i % hosts.length];
    const { name: visitorName, status } = allVisitors[i];
    const sessionId = randomUUID();
    const qrToken = generateQrToken();

    // Check if visitor already exists
    const existing = await prisma.visit.findFirst({
      where: { visitorName, visitorPhone: TEST_PHONE }
    });

    if (existing) {
      const existingToken = await prisma.qrToken.findUnique({ where: { visitId: existing.id } });
      console.log(`Visitor already exists: ${visitorName} - QR: ${existingToken?.token || 'N/A'}`);
      createdVisits.push({
        id: existing.id,
        visitorName: existing.visitorName,
        token: existingToken?.token || 'N/A',
        status: existing.status
      });
      continue;
    }

    const now = new Date();
    const visit = await prisma.visit.create({
      data: {
        sessionId,
        visitorName,
        visitorCompany: `Company ${i + 1}`,
        visitorPhone: TEST_PHONE,
        visitorEmail: TEST_EMAIL,
        purpose: purposes[i],
        location: host.location,
        status,
        hostId: host.id,
        expectedDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)),
        approvedAt: ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT'].includes(status) ? now : undefined,
        checkInAt: ['CHECKED_IN', 'CHECKED_OUT'].includes(status) ? now : undefined,
        checkOutAt: status === 'CHECKED_OUT' ? now : undefined,
        rejectedAt: status === 'REJECTED' ? now : undefined,
      }
    });

    // Create QR token for this visit
    await prisma.qrToken.create({
      data: {
        visitId: visit.id,
        token: qrToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      }
    });

    createdVisits.push({ id: visit.id, visitorName, token: qrToken, status });
    console.log(`Created visitor: ${visitorName} - QR Token: ${qrToken} (${status})`);
  }

  console.log('\n========================================');
  console.log('TEST VISITORS WITH QR CODES:');
  console.log('========================================');
  console.log('PRE REGISTER PANEL (5 records):');
  createdVisits.slice(0, 5).forEach(v => console.log(`  ${v.visitorName}: ${v.token} [${v.status}]`));
  console.log('VISITORS PANEL (5 records):');
  createdVisits.slice(5, 10).forEach(v => console.log(`  ${v.visitorName}: ${v.token} [${v.status}]`));
  console.log('========================================\n');

  return createdVisits;
}

async function main() {
  // Clear existing test data first to avoid duplicates
  await clearTestData();

  await seedDefaultUsers();
  await seedUsers();
  await seedHostsFromCsv();

  // Seed test data with QR codes for testing
  const testHosts = await seedTestHosts();
  await seedTestDeliveries(testHosts);
  await seedTestVisitorsWithQr(testHosts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
