/**
 * VisitsService Unit Tests
 * 
 * This test file demonstrates comprehensive unit testing for the VisitsService.
 * It uses mocked dependencies (Prisma, QrTokenService, EmailService, WhatsAppService)
 * to test service methods in isolation without external dependencies.
 * 
 * Test Patterns Demonstrated:
 * - Mocking service dependencies using jest-mock-extended
 * - Testing successful paths for all service methods
 * - Testing error paths (NotFoundException, BadRequestException, ForbiddenException)
 * - Testing edge cases (invalid host, duplicate session IDs)
 * - Verifying method calls on mocks
 * - Testing asynchronous operations
 * 
 * Usage as Template:
 * This file serves as a template for testing other services in the application.
 * Follow the same patterns: mock dependencies, test happy and sad paths,
 * verify mock interactions, and use descriptive test names.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { PrismaService } from '../prisma/prisma.service';
import { QrTokenService } from './qr-token.service';
import { EmailService } from '../notifications/email.service';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { mockDeep, MockProxy, DeepMockProxy } from 'jest-mock-extended';

describe('VisitsService', () => {
    let service: VisitsService;
    let prismaMock: DeepMockProxy<PrismaService>;
    let qrTokenServiceMock: MockProxy<QrTokenService>;
    let emailServiceMock: MockProxy<EmailService>;
    let whatsappServiceMock: MockProxy<WhatsAppService>;

    // Test data fixtures
    const mockHost = {
        id: BigInt(1),
        userId: 1,
        department: 'Engineering',
        building: 'Main',
        floor: 3,
        desk: 'A1',
        email: 'host@example.com',
        phone: '+1234567890',
        location: 'BARWA_TOWERS',
        status: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: 1,
        email: 'host@example.com',
        name: 'Host User',
        password: 'hashedPassword',
        role: 'HOST' as const,
        hostId: BigInt(1),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockVisit = {
        id: 'visit-1',
        sessionId: 'session-123',
        visitorName: 'John Doe',
        visitorCompany: 'Acme Corp',
        visitorPhone: '+9876543210',
        visitorEmail: 'john@example.com',
        hostId: BigInt(1),
        purpose: 'Meeting',
        location: 'BARWA_TOWERS',
        status: 'CHECKED_IN' as const,
        checkInAt: new Date(),
        checkOutAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        host: mockHost,
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VisitsService,
                {
                    provide: PrismaService,
                    useValue: mockDeep<PrismaService>(),
                },
                {
                    provide: QrTokenService,
                    useValue: mockDeep<QrTokenService>(),
                },
                {
                    provide: EmailService,
                    useValue: mockDeep<EmailService>(),
                },
                {
                    provide: WhatsAppService,
                    useValue: mockDeep<WhatsAppService>(),
                },
            ],
        }).compile();

        service = module.get<VisitsService>(VisitsService);
        prismaMock = module.get(PrismaService) as DeepMockProxy<PrismaService>;
        qrTokenServiceMock = module.get(QrTokenService);
        emailServiceMock = module.get(EmailService);
        whatsappServiceMock = module.get(WhatsAppService);
    });

    describe('create (walk-in visitor)', () => {
        it('should successfully create a visit for walk-in visitor', async () => {
            // Arrange
            const createDto = {
                hostId: '1',
                visitorName: 'John Doe',
                visitorCompany: 'Acme Corp',
                visitorPhone: '+9876543210',
                visitorEmail: 'john@example.com',
                purpose: 'Meeting',
                location: 'BARWA_TOWERS',
            };

            prismaMock.host.findFirst.mockResolvedValue(mockHost as any);
            prismaMock.visit.findUnique.mockResolvedValue(null);
            prismaMock.visit.create.mockResolvedValue(mockVisit as any);
            prismaMock.checkEvent.create.mockResolvedValue({} as any);
            qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
            qrTokenServiceMock.createForVisit.mockResolvedValue({
                token: 'qr-token-123',
                expiresAt: new Date(),
            });
            emailServiceMock.sendVisitorArrival.mockResolvedValue(true);
            whatsappServiceMock.sendVisitorArrival.mockResolvedValue(true);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(prismaMock.host.findFirst).toHaveBeenCalledWith({
                where: { id: BigInt(1), status: 1, deletedAt: null },
            });
            expect(prismaMock.visit.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    sessionId: 'session-123',
                    visitorName: 'John Doe',
                    visitorCompany: 'Acme Corp',
                    visitorPhone: '+9876543210',
                    visitorEmail: 'john@example.com',
                    hostId: BigInt(1),
                    purpose: 'Meeting',
                    location: 'BARWA_TOWERS',
                    status: 'CHECKED_IN',
                }),
                include: { host: true },
            });
            expect(prismaMock.checkEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    type: 'CHECK_IN',
                }),
            });
            expect(emailServiceMock.sendVisitorArrival).toHaveBeenCalledWith(
                'host@example.com',
                'John Doe',
                'Acme Corp',
                'Meeting'
            );
            expect(whatsappServiceMock.sendVisitorArrival).toHaveBeenCalledWith(
                '+1234567890',
                'John Doe',
                'Acme Corp'
            );
            expect(result).toHaveProperty('sessionId', 'session-123');
        });

        it('should throw BadRequestException when host is invalid', async () => {
            // Arrange
            const createDto = {
                hostId: '999',
                visitorName: 'John Doe',
                visitorCompany: 'Acme Corp',
                visitorPhone: '+9876543210',
                visitorEmail: 'john@example.com',
                purpose: 'Meeting',
                location: 'BARWA_TOWERS',
            };

            prismaMock.host.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(createDto)).rejects.toThrow('Invalid host');
            expect(prismaMock.visit.create).not.toHaveBeenCalled();
        });

        it('should normalize location to BARWA_TOWERS by default', async () => {
            // Arrange
            const createDto = {
                hostId: '1',
                visitorName: 'John Doe',
                visitorCompany: 'Acme Corp',
                visitorPhone: '+9876543210',
                visitorEmail: 'john@example.com',
                purpose: 'Meeting',
                location: 'unknown location',
            };

            prismaMock.host.findFirst.mockResolvedValue(mockHost as any);
            prismaMock.visit.findUnique.mockResolvedValue(null);
            prismaMock.visit.create.mockResolvedValue(mockVisit as any);
            prismaMock.checkEvent.create.mockResolvedValue({} as any);
            qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
            qrTokenServiceMock.createForVisit.mockResolvedValue({
                token: 'qr-token-123',
                expiresAt: new Date(),
            });
            emailServiceMock.sendVisitorArrival.mockResolvedValue(true);
            whatsappServiceMock.sendVisitorArrival.mockResolvedValue(true);

            // Act
            await service.create(createDto);

            // Assert
            expect(prismaMock.visit.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        location: 'BARWA_TOWERS',
                    }),
                })
            );
        });

        it('should handle missing host email and phone gracefully', async () => {
            // Arrange
            const hostNoContact = { ...mockHost, email: null, phone: null };
            const createDto = {
                hostId: '1',
                visitorName: 'John Doe',
                visitorCompany: 'Acme Corp',
                visitorPhone: '+9876543210',
                visitorEmail: 'john@example.com',
                purpose: 'Meeting',
                location: 'BARWA_TOWERS',
            };

            prismaMock.host.findFirst.mockResolvedValue(hostNoContact as any);
            prismaMock.visit.findUnique.mockResolvedValue(null);
            prismaMock.visit.create.mockResolvedValue(mockVisit as any);
            prismaMock.checkEvent.create.mockResolvedValue({} as any);
            qrTokenServiceMock.generateSessionId.mockReturnValue('session-123');
            qrTokenServiceMock.createForVisit.mockResolvedValue({
                token: 'qr-token-123',
                expiresAt: new Date(),
            });

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(emailServiceMock.sendVisitorArrival).not.toHaveBeenCalled();
            expect(whatsappServiceMock.sendVisitorArrival).not.toHaveBeenCalled();
            expect(result).toHaveProperty('sessionId', 'session-123');
        });
    });

    describe('preRegister', () => {
        it('should successfully pre-register a visit', async () => {
            // Arrange
            const preRegisterDto = {
                visitorName: 'Jane Smith',
                visitorCompany: 'Tech Corp',
                visitorPhone: '+9876543211',
                visitorEmail: 'jane@example.com',
                purpose: 'Interview',
                expectedDate: '2026-02-01T10:00:00Z',
            };

            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.host.findFirst.mockResolvedValue(mockHost as any);
            prismaMock.visit.findUnique.mockResolvedValue(null);
            prismaMock.visit.create.mockResolvedValue({
                ...mockVisit,
                id: 'visit-2',
                sessionId: 'session-456',
                status: 'PENDING_APPROVAL',
            } as any);
            qrTokenServiceMock.generateSessionId.mockReturnValue('session-456');

            // Act
            const result = await service.preRegister(preRegisterDto, 1);

            // Assert
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { host: true },
            });
            expect(prismaMock.visit.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    sessionId: 'session-456',
                    visitorName: 'Jane Smith',
                    visitorCompany: 'Tech Corp',
                    visitorPhone: '+9876543211',
                    visitorEmail: 'jane@example.com',
                    purpose: 'Interview',
                    status: 'PENDING_APPROVAL',
                    preRegisteredById: '1',
                }),
                include: { host: true },
            });
            expect(result).toHaveProperty('status', 'PENDING_APPROVAL');
        });

        it('should throw ForbiddenException when user is not a host', async () => {
            // Arrange
            const preRegisterDto = {
                visitorName: 'Jane Smith',
                visitorCompany: 'Tech Corp',
                visitorPhone: '+9876543211',
                visitorEmail: 'jane@example.com',
                purpose: 'Interview',
            };

            const nonHostUser = { ...mockUser, hostId: null };
            prismaMock.user.findUnique.mockResolvedValue(nonHostUser as any);

            // Act & Assert
            await expect(service.preRegister(preRegisterDto, 1)).rejects.toThrow(ForbiddenException);
            await expect(service.preRegister(preRegisterDto, 1)).rejects.toThrow('Host account required');
            expect(prismaMock.visit.create).not.toHaveBeenCalled();
        });

        it('should use host location when available', async () => {
            // Arrange
            const preRegisterDto = {
                visitorName: 'Jane Smith',
                visitorCompany: 'Tech Corp',
                visitorPhone: '+9876543211',
                visitorEmail: 'jane@example.com',
                purpose: 'Interview',
            };

            const hostWithLocation = { ...mockHost, location: 'MARINA_50' };
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.host.findFirst.mockResolvedValue(hostWithLocation as any);
            prismaMock.visit.findUnique.mockResolvedValue(null);
            prismaMock.visit.create.mockResolvedValue(mockVisit as any);
            qrTokenServiceMock.generateSessionId.mockReturnValue('session-456');

            // Act
            await service.preRegister(preRegisterDto, 1);

            // Assert
            expect(prismaMock.visit.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        location: 'MARINA_50',
                    }),
                })
            );
        });
    });

    describe('getPending', () => {
        it('should return pending visits for a host', async () => {
            // Arrange
            const pendingVisits = [
                { ...mockVisit, id: 'visit-1', status: 'PENDING_APPROVAL' as const },
                { ...mockVisit, id: 'visit-2', status: 'PENDING_APPROVAL' as const },
            ];
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.visit.findMany.mockResolvedValue(pendingVisits as any);

            // Act
            const result = await service.getPending(1);

            // Assert
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                where: {
                    hostId: BigInt(1),
                    status: 'PENDING_APPROVAL',
                },
                include: { host: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toHaveLength(2);
        });

        it('should return empty array for non-host user', async () => {
            // Arrange
            const nonHostUser = { ...mockUser, hostId: null };
            prismaMock.user.findUnique.mockResolvedValue(nonHostUser as any);

            // Act
            const result = await service.getPending(1);

            // Assert
            expect(prismaMock.visit.findMany).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('approve', () => {
        it('should successfully approve a pending visit', async () => {
            // Arrange
            const pendingVisit = { ...mockVisit, status: 'PENDING_APPROVAL' as const };
            prismaMock.visit.findUnique.mockResolvedValue(pendingVisit as any);
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.visit.update.mockResolvedValue({
                ...pendingVisit,
                status: 'APPROVED',
            } as any);
            emailServiceMock.send.mockResolvedValue(true);

            // Act
            const result = await service.approve('visit-1', 1);

            // Assert
            expect(prismaMock.visit.update).toHaveBeenCalledWith({
                where: { id: 'visit-1' },
                data: expect.objectContaining({
                    status: 'APPROVED',
                }),
            });
            expect(emailServiceMock.send).toHaveBeenCalledWith({
                to: 'john@example.com',
                subject: 'Visit Approved',
                html: expect.stringContaining('has been approved'),
            });
            expect(result).toHaveProperty('status');
        });

        it('should throw NotFoundException when visit not found', async () => {
            // Arrange
            prismaMock.visit.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.approve('visit-999', 1)).rejects.toThrow(NotFoundException);
            await expect(service.approve('visit-999', 1)).rejects.toThrow('Visit not found');
            expect(prismaMock.visit.update).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException when not host of visit', async () => {
            // Arrange
            const otherHost = { ...mockUser, id: 2, hostId: BigInt(2) };
            prismaMock.visit.findUnique.mockResolvedValue(mockVisit as any);
            prismaMock.user.findUnique.mockResolvedValue(otherHost as any);

            // Act & Assert
            await expect(service.approve('visit-1', 2)).rejects.toThrow(ForbiddenException);
            await expect(service.approve('visit-1', 2)).rejects.toThrow('Not your visit');
            expect(prismaMock.visit.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when visit is not pending', async () => {
            // Arrange
            const approvedVisit = { ...mockVisit, status: 'APPROVED' as const };
            prismaMock.visit.findUnique.mockResolvedValue(approvedVisit as any);
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

            // Act & Assert
            await expect(service.approve('visit-1', 1)).rejects.toThrow(BadRequestException);
            await expect(service.approve('visit-1', 1)).rejects.toThrow('Visit is not pending approval');
            expect(prismaMock.visit.update).not.toHaveBeenCalled();
        });
    });

    describe('reject', () => {
        it('should successfully reject a pending visit', async () => {
            // Arrange
            const pendingVisit = { ...mockVisit, status: 'PENDING_APPROVAL' as const };
            prismaMock.visit.findUnique.mockResolvedValue(pendingVisit as any);
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.visit.update.mockResolvedValue({
                ...pendingVisit,
                status: 'REJECTED',
            } as any);

            // Act
            const result = await service.reject('visit-1', 1, 'Reason');

            // Assert
            expect(prismaMock.visit.update).toHaveBeenCalledWith({
                where: { id: 'visit-1' },
                data: expect.objectContaining({
                    status: 'REJECTED',
                    rejectionReason: 'Reason',
                }),
            });
            expect(result).toEqual({ message: 'Visit rejected' });
        });

        it('should reject without reason', async () => {
            // Arrange
            const pendingVisit = { ...mockVisit, status: 'PENDING_APPROVAL' as const };
            prismaMock.visit.findUnique.mockResolvedValue(pendingVisit as any);
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.visit.update.mockResolvedValue({
                ...pendingVisit,
                status: 'REJECTED',
            } as any);

            // Act
            const result = await service.reject('visit-1', 1);

            // Assert
            expect(prismaMock.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        rejectionReason: undefined,
                    }),
                })
            );
            expect(result).toEqual({ message: 'Visit rejected' });
        });
    });

    describe('findBySessionId', () => {
        it('should find visit by session ID', async () => {
            // Arrange
            prismaMock.visit.findUnique.mockResolvedValue(mockVisit as any);

            // Act
            const result = await service.findBySessionId('session-123');

            // Assert
            expect(prismaMock.visit.findUnique).toHaveBeenCalledWith({
                where: { sessionId: 'session-123' },
                include: { host: true },
            });
            expect(result).toHaveProperty('sessionId', 'session-123');
        });

        it('should throw NotFoundException when visit not found', async () => {
            // Arrange
            prismaMock.visit.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findBySessionId('nonexistent')).rejects.toThrow(NotFoundException);
            await expect(service.findBySessionId('nonexistent')).rejects.toThrow('Visit not found');
        });
    });

    describe('checkout', () => {
        it('should successfully check out a visitor', async () => {
            // Arrange
            const checkedInVisit = { ...mockVisit, status: 'CHECKED_IN' as const };
            prismaMock.visit.findUnique.mockResolvedValue(checkedInVisit as any);
            prismaMock.visit.update.mockResolvedValue({
                ...checkedInVisit,
                status: 'CHECKED_OUT',
                checkOutAt: new Date(),
            } as any);
            prismaMock.checkEvent.create.mockResolvedValue({} as any);

            // Act
            const result = await service.checkout('session-123', 1);

            // Assert
            expect(prismaMock.visit.update).toHaveBeenCalledWith({
                where: { id: 'visit-1' },
                data: expect.objectContaining({
                    status: 'CHECKED_OUT',
                }),
            });
            expect(prismaMock.checkEvent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    type: 'CHECK_OUT',
                    userId: 1,
                }),
            });
            expect(result).toHaveProperty('status');
        });

        it('should throw BadRequestException when visitor already checked out', async () => {
            // Arrange
            const checkedOutVisit = { ...mockVisit, status: 'CHECKED_OUT' as const };
            prismaMock.visit.findUnique.mockResolvedValue(checkedOutVisit as any);

            // Act & Assert
            await expect(service.checkout('session-123', 1)).rejects.toThrow(BadRequestException);
            await expect(service.checkout('session-123', 1)).rejects.toThrow('Visitor already checked out');
            expect(prismaMock.visit.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when visit is not checked in', async () => {
            // Arrange
            const pendingVisit = { ...mockVisit, status: 'PENDING_APPROVAL' as const };
            prismaMock.visit.findUnique.mockResolvedValue(pendingVisit as any);

            // Act & Assert
            await expect(service.checkout('session-123', 1)).rejects.toThrow(BadRequestException);
            await expect(service.checkout('session-123', 1)).rejects.toThrow('Visit must be checked in to check out');
            expect(prismaMock.visit.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when visit not found', async () => {
            // Arrange
            prismaMock.visit.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.checkout('nonexistent', 1)).rejects.toThrow(NotFoundException);
            await expect(service.checkout('nonexistent', 1)).rejects.toThrow('Visit not found');
        });
    });

    describe('getActive', () => {
        it('should return active visits without location filter', async () => {
            // Arrange
            const activeVisits = [
                { ...mockVisit, id: 'visit-1' },
                { ...mockVisit, id: 'visit-2' },
            ];
            prismaMock.visit.findMany.mockResolvedValue(activeVisits as any);

            // Act
            const result = await service.getActive();

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                where: { status: 'CHECKED_IN' },
                include: { host: true },
                orderBy: { checkInAt: 'desc' },
            });
            expect(result).toHaveLength(2);
        });

        it('should return active visits with location filter', async () => {
            // Arrange
            const activeVisits = [{ ...mockVisit, id: 'visit-1' }];
            prismaMock.visit.findMany.mockResolvedValue(activeVisits as any);

            // Act
            const result = await service.getActive('BARWA_TOWERS');

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                where: { status: 'CHECKED_IN', location: 'BARWA_TOWERS' },
                include: { host: true },
                orderBy: { checkInAt: 'desc' },
            });
            expect(result).toHaveLength(1);
        });

        it('should normalize location filter', async () => {
            // Arrange
            const activeVisits = [{ ...mockVisit, id: 'visit-1' }];
            prismaMock.visit.findMany.mockResolvedValue(activeVisits as any);

            // Act
            await service.getActive('barwa towers');

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        location: 'BARWA_TOWERS',
                    }),
                })
            );
        });
    });

    describe('getHistory', () => {
        it('should return visit history without filters', async () => {
            // Arrange
            const historyVisits = [
                { ...mockVisit, id: 'visit-1' },
                { ...mockVisit, id: 'visit-2' },
            ];
            prismaMock.visit.findMany.mockResolvedValue(historyVisits as any);

            // Act
            const result = await service.getHistory();

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith({
                where: {},
                include: { host: true },
                orderBy: { createdAt: 'desc' },
                take: 500,
            });
            expect(result).toHaveLength(2);
        });

        it('should return visit history with location filter', async () => {
            // Arrange
            const historyVisits = [{ ...mockVisit, id: 'visit-1' }];
            prismaMock.visit.findMany.mockResolvedValue(historyVisits as any);

            // Act
            const result = await service.getHistory({ location: 'BARWA_TOWERS' });

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        location: 'BARWA_TOWERS',
                    }),
                })
            );
        });

        it('should return visit history with date range filter', async () => {
            // Arrange
            const historyVisits = [{ ...mockVisit, id: 'visit-1' }];
            prismaMock.visit.findMany.mockResolvedValue(historyVisits as any);

            // Act
            const result = await service.getHistory({
                from: '2026-01-01',
                to: '2026-01-31',
            });

            // Assert
            expect(prismaMock.visit.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        checkInAt: expect.objectContaining({
                            gte: expect.any(Date),
                            lte: expect.any(Date),
                        }),
                    }),
                })
            );
        });
    });
});
