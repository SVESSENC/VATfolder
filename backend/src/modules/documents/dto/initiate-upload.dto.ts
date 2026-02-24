import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class InitiateUploadDto {
  @ApiProperty({ description: 'Original filename', example: 'registration-form.pdf' })
  @IsString()
  @MaxLength(255)
  filename!: string;

  @ApiProperty({ description: 'MIME content type', example: 'application/pdf' })
  @IsString()
  contentType!: string;

  @ApiPropertyOptional({ description: 'SHA-256 checksum of the file for integrity verification' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'checksum must be a valid SHA-256 hex string' })
  checksum?: string;
}
