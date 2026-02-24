import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService) {}

  async getOrganisationByCvr(cvr: string) {
    return this.prisma.organisation.findUnique({
      where: { cvr },
    });
  }
}
