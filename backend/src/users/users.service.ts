import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
    });
    const { password: _p, ...safe } = user;
    return safe;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return users.map(({ password: _p, ...u }) => u);
  }

  async findDefenders() {
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['DEFENSOR', ] }, active: true },
      orderBy: { name: 'asc' },
    });
    return users.map(({ password: _p, ...u }) => u);
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { active: false } });
  }
}
