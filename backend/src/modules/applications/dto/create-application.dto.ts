import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @ApiPropertyOptional({ description: 'Organisation CVR or ID' })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @ApiPropertyOptional({ description: 'Obligation assessment ID to link' })
  @IsOptional()
  @IsUUID()
  obligationAssessmentId?: string;

  @ApiProperty({ description: 'Application form data as JSON object' })
  @IsObject()
  applicationData!: Record<string, unknown>;
}
