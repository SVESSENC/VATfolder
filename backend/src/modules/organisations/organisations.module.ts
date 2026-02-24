import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
