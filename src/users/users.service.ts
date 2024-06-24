import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.databaseService.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return await this.databaseService.user.findMany();
  }

  async findOne(username: string) {
    return await this.databaseService.user.findUnique({
      where: { username: username },
    });
  }

  async findByEmail(email: string) {
    return await this.databaseService.user.findUnique({
      where: { email: email },
    });
  }
}
