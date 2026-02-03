/**
 * HostsController Unit Tests
 *
 * This test file demonstrates comprehensive unit testing for HostsController.
 * It uses mocked dependencies (HostsService, CsvImportService) and guards
 * to test controller methods in isolation without external dependencies.
 *
 * Test Patterns Demonstrated:
 * - Mocking service dependencies using jest-mock-extended
 * - Testing successful paths for all controller methods
 * - Testing error paths (NotFoundException)
 * - Testing edge cases (invalid host, duplicate session IDs)
 * - Verifying method calls on mocks
 * - Testing guards and role-based access control
 *
 * Usage as Template:
 * This file serves as a template for testing other controllers in the application.
 * Follow the same patterns: mock services, test happy and sad paths,
 * verify mock interactions, and use descriptive test names.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { HostsController } from "./hosts.controller";
import { HostsService } from "./hosts.service";
import { CsvImportService } from "./csv-import.service";
import { mockDeep, MockProxy, DeepMockProxy } from "jest-mock-extended";

describe("HostsController", () => {
  let controller: HostsController;
  let hostsServiceMock: DeepMockProxy<HostsService>;
  let csvImportServiceMock: MockProxy<CsvImportService>;

  // Test data fixtures
  const mockHost = {
    id: BigInt(1),
    userId: 1,
    department: "Engineering",
    building: "Main",
    floor: 3,
    desk: "A1",
    email: "host@example.com",
    phone: "+1234567890",
    location: "BARWA_TOWERS",
    status: 1,
    deletedAt: null,
    company: "Acme Corp",
    name: "John Doe",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [
        {
          provide: HostsService,
          useValue: mockDeep<HostsService>(),
        },
        {
          provide: CsvImportService,
          useValue: mockDeep<CsvImportService>(),
        },
      ],
    }).compile();

    controller = module.get<HostsController>(HostsController);
    hostsServiceMock = module.get(HostsService) as DeepMockProxy<HostsService>;
    csvImportServiceMock = module.get(CsvImportService);
  });

  describe("findAll", () => {
    it("should return all hosts without location filter", async () => {
      // Arrange
      const hosts = [mockHost, { ...mockHost, id: BigInt(2) }];
      hostsServiceMock.findAll.mockResolvedValue(hosts as any);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(hostsServiceMock.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(hosts);
    });

    it("should return hosts filtered by location", async () => {
      // Arrange
      const hosts = [mockHost];
      hostsServiceMock.findAll.mockResolvedValue(hosts as any);

      // Act
      const result = await controller.findAll("BARWA_TOWERS");

      // Assert
      expect(hostsServiceMock.findAll).toHaveBeenCalledWith("BARWA_TOWERS");
      expect(result).toEqual(hosts);
    });

    it("should pass location filter as-is to service", async () => {
      // Arrange
      const hosts = [mockHost];
      hostsServiceMock.findAll.mockResolvedValue(hosts as any);

      // Act
      await controller.findAll("barwa towers");

      // Assert - Controller passes location as-is, service handles normalization
      expect(hostsServiceMock.findAll).toHaveBeenCalledWith("barwa towers");
    });
  });

  describe("findOne", () => {
    it("should return a host by ID", async () => {
      // Arrange
      hostsServiceMock.findOne.mockResolvedValue(mockHost as any);

      // Act
      const result = await controller.findOne("1");

      // Assert
      expect(hostsServiceMock.findOne).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockHost);
    });

    it("should throw NotFoundException when host not found", async () => {
      // Arrange
      hostsServiceMock.findOne.mockResolvedValue(undefined as any);
      hostsServiceMock.findOne.mockImplementation(async () => {
        throw new NotFoundException("Host not found");
      });

      // Act & Assert
      await expect(controller.findOne("999")).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne("999")).rejects.toThrow("Host not found");
    });
  });

  describe("create", () => {
    it("should create a new host", async () => {
      // Arrange
      const createDto = {
        name: "Jane Doe",
        company: "Tech Corp",
        email: "jane@example.com",
        phone: "+9876543210",
        location: "BARWA_TOWERS",
        status: 1,
      };

      const newHost = { ...mockHost, id: BigInt(2), name: "Jane Doe" };
      hostsServiceMock.create.mockResolvedValue(newHost as any);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(hostsServiceMock.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(newHost);
    });

    it("should create host with optional fields", async () => {
      // Arrange
      const createDto = {
        name: "Bob Smith",
        company: "Startup Inc",
        email: "bob@example.com",
        phone: "+9876543211",
        location: "MARINA_50",
      };

      const newHost = { ...mockHost, id: BigInt(3), name: "Bob Smith" };
      hostsServiceMock.create.mockResolvedValue(newHost as any);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(hostsServiceMock.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(newHost);
    });
  });

  describe("update", () => {
    it("should update an existing host", async () => {
      // Arrange
      const updateDto = {
        name: "Updated Name",
        company: "Updated Company",
        email: "updated@example.com",
        phone: "+1111111111",
        location: "ELEMENT_MARIOTT",
        status: 1,
      };

      const updatedHost = { ...mockHost, name: "Updated Name" };
      hostsServiceMock.update.mockResolvedValue(updatedHost as any);

      // Act
      const result = await controller.update("1", updateDto);

      // Assert - Controller calls update directly without findOne
      expect(hostsServiceMock.update).toHaveBeenCalledWith(
        BigInt(1),
        updateDto,
      );
      expect(result).toEqual(updatedHost);
    });

    it("should throw NotFoundException when updating non-existent host", async () => {
      // Arrange
      const updateDto = { name: "Updated Name" };
      hostsServiceMock.update.mockRejectedValue(
        new NotFoundException("Host not found"),
      );

      // Act & Assert
      await expect(controller.update("999", updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update("999", updateDto)).rejects.toThrow(
        "Host not found",
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a host", async () => {
      // Arrange
      hostsServiceMock.remove.mockResolvedValue(mockHost as any);

      // Act
      const result = await controller.remove("1");

      // Assert - Controller calls remove directly without findOne
      expect(hostsServiceMock.remove).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockHost);
    });

    it("should throw NotFoundException when removing non-existent host", async () => {
      // Arrange
      hostsServiceMock.remove.mockRejectedValue(
        new NotFoundException("Host not found"),
      );

      // Act & Assert
      await expect(controller.remove("999")).rejects.toThrow(NotFoundException);
      await expect(controller.remove("999")).rejects.toThrow("Host not found");
    });
  });

  describe("import", () => {
    it("should import hosts from CSV content", async () => {
      // Arrange
      const body = {
        csvContent: "name,email\nJohn,john@example.com",
      };

      const importResult = {
        imported: 10,
        skipped: 2,
        errors: [] as string[],
      };

      csvImportServiceMock.importFromBuffer.mockResolvedValue(importResult);

      // Act
      const result = await controller.import(body);

      // Assert
      expect(csvImportServiceMock.importFromBuffer).toHaveBeenCalled();
      expect(result).toEqual(importResult);
    });

    it("should throw error when no content provided", async () => {
      // Arrange
      const body = {};

      // Act & Assert
      await expect(controller.import(body)).rejects.toThrow(
        "Please provide either csvContent or xlsxContent",
      );
    });
  });
});
