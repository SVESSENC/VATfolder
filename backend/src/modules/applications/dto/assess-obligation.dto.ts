import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class AssessObligationDto {
  @ApiProperty({ description: 'Business activity and turnover data for assessment' })
  @IsObject()
  assessmentData!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'CVR of the organisation being assessed' })
  @IsOptional()
  @IsString()
  cvr?: string;
}
