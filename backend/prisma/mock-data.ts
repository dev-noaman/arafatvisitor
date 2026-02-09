import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============ MARKER for easy cleanup ============
// All mock data uses IDs in a known range or a tag prefix
const MOCK_HOST_START_ID = 900000n;
const MOCK_VISITOR_PREFIX = 'mock-visit-';
const MOCK_DELIVERY_PREFIX = 'mock-delivery-';
const MOCK_PREREG_PREFIX = 'mock-prereg-';

const VISITOR_PHONE = '97450707317';
const VISITOR_EMAIL = 'adel.noaman@arafatgroup.com';

// ============ MOCK HOSTS ============
const mockHosts = [
  { id: 900001n, name: 'Ahmed Al-Thani', company: 'Qatar Petroleum', email: 'ahmed@qp.qa', phone: '97455001001', location: 'BARWA_TOWERS' as const },
  { id: 900002n, name: 'Sara Mohammed', company: 'Ooredoo Qatar', email: 'sara@ooredoo.qa', phone: '97455002002', location: 'MARINA_50' as const },
  { id: 900003n, name: 'Khalid Hassan', company: 'Qatar Airways', email: 'khalid@qatarairways.com', phone: '97455003003', location: 'ELEMENT_MARIOTT' as const },
  { id: 900004n, name: 'Fatima Al-Mansouri', company: 'Ashghal', email: 'fatima@ashghal.gov.qa', phone: '97455004004', location: 'BARWA_TOWERS' as const },
  { id: 900005n, name: 'Omar Youssef', company: 'Vodafone Qatar', email: 'omar@vodafone.qa', phone: '97455005005', location: 'MARINA_50' as const },
  { id: 900006n, name: 'Noor Al-Sulaiti', company: 'QNB Group', email: 'noor@qnb.com.qa', phone: '97455006006', location: 'BARWA_TOWERS' as const },
  { id: 900007n, name: 'Hassan Ibrahim', company: 'Kahramaa', email: 'hassan@kahramaa.qa', phone: '97455007007', location: 'ELEMENT_MARIOTT' as const },
  { id: 900008n, name: 'Maryam Al-Kuwari', company: 'Qatar Foundation', email: 'maryam@qf.org.qa', phone: '97455008008', location: 'MARINA_50' as const },
  { id: 900009n, name: 'Youssef Saleh', company: 'Nakilat', email: 'youssef@nakilat.com.qa', phone: '97455009009', location: 'BARWA_TOWERS' as const },
  { id: 900010n, name: 'Layla Abdulrahman', company: 'Qatar Steel', email: 'layla@qatarsteel.qa', phone: '97455010010', location: 'ELEMENT_MARIOTT' as const },
];

// ============ MOCK VISITORS ============
const mockVisitors = [
  { suffix: '001', name: 'Adel Noaman', company: 'Arafat Group', purpose: 'Meeting', hostIdx: 0, status: 'CHECKED_IN' as const },
  { suffix: '002', name: 'Mohammed Farid', company: 'Al Jazeera Media', purpose: 'Interview', hostIdx: 1, status: 'APPROVED' as const },
  { suffix: '003', name: 'Rania Khaled', company: 'Gulf Solutions', purpose: 'Meeting', hostIdx: 2, status: 'CHECKED_IN' as const },
  { suffix: '004', name: 'Tariq Hamdi', company: 'Tech Arabia', purpose: 'Maintenance', hostIdx: 3, status: 'APPROVED' as const },
  { suffix: '005', name: 'Huda Salem', company: 'Doha Consulting', purpose: 'Meeting', hostIdx: 4, status: 'CHECKED_IN' as const },
  { suffix: '006', name: 'Ali Nasser', company: 'Gulf Logistics', purpose: 'Delivery', hostIdx: 5, status: 'CHECKED_OUT' as const },
  { suffix: '007', name: 'Samira Hassan', company: 'Qatar Design', purpose: 'Meeting', hostIdx: 6, status: 'APPROVED' as const },
  { suffix: '008', name: 'Faisal Majid', company: 'Al Maha Services', purpose: 'Interview', hostIdx: 7, status: 'CHECKED_IN' as const },
  { suffix: '009', name: 'Noura Al-Ali', company: 'Barwa Real Estate', purpose: 'Meeting', hostIdx: 8, status: 'APPROVED' as const },
  { suffix: '010', name: 'Wael Rashid', company: 'Milaha', purpose: 'Maintenance', hostIdx: 9, status: 'CHECKED_OUT' as const },
];

// ============ MOCK PRE-REGISTRATIONS ============
const mockPreRegs = [
  { suffix: '001', name: 'Jassim Al-Buainain', company: 'Qatar Gas', purpose: 'Meeting', hostIdx: 0, status: 'PENDING_APPROVAL' as const },
  { suffix: '002', name: 'Aisha Nabil', company: 'Education City', purpose: 'Interview', hostIdx: 1, status: 'PENDING_APPROVAL' as const },
  { suffix: '003', name: 'Bader Al-Dosari', company: 'Msheireb Properties', purpose: 'Meeting', hostIdx: 2, status: 'PENDING_APPROVAL' as const },
  { suffix: '004', name: 'Dana Suleiman', company: 'Hamad Medical', purpose: 'Maintenance', hostIdx: 3, status: 'REJECTED' as const },
  { suffix: '005', name: 'Hamad Khalifa', company: 'QSTP', purpose: 'Meeting', hostIdx: 4, status: 'PENDING_APPROVAL' as const },
  { suffix: '006', name: 'Lina Mahmoud', company: 'Qatar University', purpose: 'Interview', hostIdx: 5, status: 'PENDING_APPROVAL' as const },
  { suffix: '007', name: 'Majid Al-Naimi', company: 'QatarEnergy', purpose: 'Meeting', hostIdx: 6, status: 'REJECTED' as const },
  { suffix: '008', name: 'Salwa Ibrahim', company: 'Lusail City', purpose: 'Meeting', hostIdx: 7, status: 'PENDING_APPROVAL' as const },
  { suffix: '009', name: 'Rashid Tawfiq', company: 'Qatar Tourism', purpose: 'Maintenance', hostIdx: 8, status: 'PENDING_APPROVAL' as const },
  { suffix: '010', name: 'Ghada Fares', company: 'Al Rayyan Group', purpose: 'Meeting', hostIdx: 9, status: 'PENDING_APPROVAL' as const },
];

// ============ MOCK DELIVERIES ============
const mockDeliveries = [
  { suffix: '001', recipient: 'Ahmed Al-Thani', hostIdx: 0, type: 'Document', courier: 'DHL', status: 'RECEIVED' as const },
  { suffix: '002', recipient: 'Sara Mohammed', hostIdx: 1, type: 'Food', courier: 'Aramex', status: 'RECEIVED' as const },
  { suffix: '003', recipient: 'Khalid Hassan', hostIdx: 2, type: 'Gift', courier: 'FedEx', status: 'PICKED_UP' as const },
  { suffix: '004', recipient: 'Fatima Al-Mansouri', hostIdx: 3, type: 'Document', courier: 'Qatar Post', status: 'RECEIVED' as const },
  { suffix: '005', recipient: 'Omar Youssef', hostIdx: 4, type: 'Document', courier: 'UPS', status: 'RECEIVED' as const },
  { suffix: '006', recipient: 'Noor Al-Sulaiti', hostIdx: 5, type: 'Food', courier: 'TNT Express', status: 'PICKED_UP' as const },
  { suffix: '007', recipient: 'Hassan Ibrahim', hostIdx: 6, type: 'Gift', courier: 'DHL', status: 'RECEIVED' as const },
  { suffix: '008', recipient: 'Maryam Al-Kuwari', hostIdx: 7, type: 'Document', courier: 'Aramex', status: 'RECEIVED' as const },
  { suffix: '009', recipient: 'Youssef Saleh', hostIdx: 8, type: 'Document', courier: 'FedEx', status: 'PICKED_UP' as const },
  { suffix: '010', recipient: 'Layla Abdulrahman', hostIdx: 9, type: 'Food', courier: 'Qatar Post', status: 'RECEIVED' as const },
];

// ============ SEED FUNCTION ============
async function seed() {
  console.log('Upserting mock data (insert or reset to original state)...\n');

  // 1. Create/Reset Hosts
  console.log('Upserting 10 mock hosts...');
  for (const h of mockHosts) {
    const hostData = {
      name: h.name,
      company: h.company,
      email: h.email,
      phone: h.phone,
      location: h.location,
      type: 'EXTERNAL' as const,
      status: 1,
    };
    await prisma.host.upsert({
      where: { id: h.id },
      update: hostData,
      create: { id: h.id, ...hostData },
    });
  }
  console.log('  -> 10 hosts upserted\n');

  // 2. Create/Reset Visitors (APPROVED / CHECKED_IN / CHECKED_OUT)
  console.log('Upserting 10 mock visitors...');
  const now = new Date();
  for (const v of mockVisitors) {
    const id = `${MOCK_VISITOR_PREFIX}${v.suffix}`;
    const host = mockHosts[v.hostIdx];
    const visitData = {
      sessionId: `mock-session-${v.suffix}`,
      visitorName: v.name,
      visitorCompany: v.company,
      visitorPhone: VISITOR_PHONE,
      visitorEmail: VISITOR_EMAIL,
      hostId: host.id,
      purpose: v.purpose,
      location: host.location,
      status: v.status,
      expectedDate: now,
      approvedAt: now,
      checkInAt: v.status === 'CHECKED_IN' || v.status === 'CHECKED_OUT' ? now : null,
      checkOutAt: v.status === 'CHECKED_OUT' ? now : null,
      rejectedAt: null,
      rejectionReason: null,
    };
    await prisma.visit.upsert({
      where: { id },
      update: visitData,
      create: { id, ...visitData },
    });
  }
  console.log('  -> 10 visitors upserted\n');

  // 3. Create/Reset Pre-Registrations (PENDING_APPROVAL / REJECTED)
  console.log('Upserting 10 mock pre-registrations...');
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  for (const pr of mockPreRegs) {
    const id = `${MOCK_PREREG_PREFIX}${pr.suffix}`;
    const host = mockHosts[pr.hostIdx];
    const preRegData = {
      sessionId: `mock-prereg-session-${pr.suffix}`,
      visitorName: pr.name,
      visitorCompany: pr.company,
      visitorPhone: `9745050${pr.suffix}`,
      visitorEmail: `${pr.name.split(' ')[0].toLowerCase()}@mock.qa`,
      hostId: host.id,
      purpose: pr.purpose,
      location: host.location,
      status: pr.status,
      expectedDate: tomorrow,
      approvedAt: null,
      checkInAt: null,
      checkOutAt: null,
      rejectedAt: pr.status === 'REJECTED' ? now : null,
      rejectionReason: pr.status === 'REJECTED' ? 'Schedule conflict' : null,
    };
    await prisma.visit.upsert({
      where: { id },
      update: preRegData,
      create: { id, ...preRegData },
    });
  }
  console.log('  -> 10 pre-registrations upserted\n');

  // 4. Create/Reset Deliveries
  console.log('Upserting 10 mock deliveries...');
  for (const d of mockDeliveries) {
    const id = `${MOCK_DELIVERY_PREFIX}${d.suffix}`;
    const host = mockHosts[d.hostIdx];
    const deliveryData = {
      deliveryType: d.type,
      recipient: d.recipient,
      hostId: host.id,
      courier: d.courier,
      location: host.location,
      status: d.status,
      notes: `Mock delivery for demo - ${d.type}`,
      receivedAt: now,
      pickedUpAt: d.status === 'PICKED_UP' ? now : null,
    };
    await prisma.delivery.upsert({
      where: { id },
      update: deliveryData,
      create: { id, ...deliveryData },
    });
  }
  console.log('  -> 10 deliveries upserted\n');

  console.log('Mock data seeded (upserted) successfully!');
  console.log('Re-run to reset all data back to original state.');
  console.log('To remove: npx ts-node prisma/mock-data.ts --remove');
}

// ============ CLEANUP FUNCTION ============
async function remove() {
  console.log('Removing all mock data...\n');

  // Remove in order: QrTokens -> CheckEvents -> Visits -> Deliveries -> Hosts
  const visitIds = [
    ...mockVisitors.map((v) => `${MOCK_VISITOR_PREFIX}${v.suffix}`),
    ...mockPreRegs.map((pr) => `${MOCK_PREREG_PREFIX}${pr.suffix}`),
  ];
  const deliveryIds = mockDeliveries.map((d) => `${MOCK_DELIVERY_PREFIX}${d.suffix}`);
  const hostIds = mockHosts.map((h) => h.id);

  // 1. Delete QR tokens for mock visits
  const qrResult = await prisma.qrToken.deleteMany({
    where: { visitId: { in: visitIds } },
  });
  console.log(`  Deleted ${qrResult.count} QR tokens`);

  // 2. Delete check events for mock visits
  const ceResult = await prisma.checkEvent.deleteMany({
    where: { visitId: { in: visitIds } },
  });
  console.log(`  Deleted ${ceResult.count} check events`);

  // 3. Delete mock visits + pre-registrations
  const visitResult = await prisma.visit.deleteMany({
    where: { id: { in: visitIds } },
  });
  console.log(`  Deleted ${visitResult.count} visits/pre-registrations`);

  // 4. Delete mock deliveries
  const delResult = await prisma.delivery.deleteMany({
    where: { id: { in: deliveryIds } },
  });
  console.log(`  Deleted ${delResult.count} deliveries`);

  // 5. Delete mock hosts
  const hostResult = await prisma.host.deleteMany({
    where: { id: { in: hostIds } },
  });
  console.log(`  Deleted ${hostResult.count} hosts`);

  console.log('\nAll mock data removed successfully!');
}

// ============ MAIN ============
const isRemove = process.argv.includes('--remove');

(isRemove ? remove() : seed())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
