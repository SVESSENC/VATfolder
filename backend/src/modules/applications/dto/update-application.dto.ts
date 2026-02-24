import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ description: 'Updated application form data' })
  @IsOptional()
  @IsObject()
  applicationData?: Record<string, unknown>;
}
