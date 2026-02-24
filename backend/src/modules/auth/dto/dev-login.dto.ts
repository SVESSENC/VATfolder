import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class DevLoginDto {
  @ApiProperty({ example: 'developer@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Test User' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
