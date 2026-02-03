import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { Role } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }
    const passwordHash = await this.authService.hashPassword(dto.password);
    const hostIdNum = dto.hostId ? BigInt(dto.hostId) : undefined;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: passwordHash,
        name: dto.name,
        role: dto.role as Role,
        hostId: hostIdNum,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
      },
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: {
      name?: string;
      role?: Role;
      hostId?: bigint | null;
      password?: string;
    } = {};
    if (dto.name != null) data.name = dto.name;
    if (dto.role != null) data.role = dto.role as Role;
    if (dto.hostId !== undefined)
      data.hostId = dto.hostId ? BigInt(dto.hostId) : null;
    if (dto.password != null)
      data.password = await this.authService.hashPassword(dto.password);
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hostId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: "User deleted" };
  }
}
