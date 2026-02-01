import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    try {
        // Delete in correct order to satisfy foreign key constraints

        console.log('Cleaning up QrTokens...');
        await prisma.qrToken.deleteMany({});

        console.log('Cleaning up CheckEvents...');
        await prisma.checkEvent.deleteMany({});

        console.log('Cleaning up AuditLogs...');
        await prisma.auditLog.deleteMany({});

        console.log('Cleaning up Visits...');
        await prisma.visit.deleteMany({});

        console.log('Cleaning up Deliveries...');
        await prisma.delivery.deleteMany({});

        console.log('Cleaning up HOST users...');
        await prisma.user.deleteMany({
            where: {
                role: 'HOST',
            },
        });

        console.log('Cleaning up Hosts...');
        // We can't just deleteMany if there are other relations, but these are the main ones
        await prisma.host.deleteMany({});

        console.log('Database cleanup completed successfully.');
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
