import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ValidateApplicationDto {
  @ApiPropertyOptional({
    description: 'Specific ruleset version to validate against',
    example: '2026-01',
  })
  @IsOptional()
  @IsString()
  rulesetVersion?: string;
}
