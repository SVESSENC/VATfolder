import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';

@Module({
  imports: [PrismaModule],
  controllers: [ValidationController],
  providers: [ValidationService],
})
export class ValidationModule {}
