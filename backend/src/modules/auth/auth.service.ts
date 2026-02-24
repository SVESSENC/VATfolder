import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(mitidSub: string, email: string) {
    let user = await this.prisma.user.findUnique({
      where: { mitidSub },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mitidSub,
          email,
        },
      });
    }

    return user;
  }

  async updateDisplayName(userId: string, displayName: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
  }

  generateToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}
