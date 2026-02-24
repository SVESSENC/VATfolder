import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DevLoginDto } from './dto/dev-login.dto';

@Controller('api/v1/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('oidc/initiate')
  @ApiOperation({ summary: 'Initiate MitID OIDC authentication flow' })
  async initiateOidc() {
    // TODO: Implement MitID OIDC flow
    return { message: 'OIDC flow initiated' };
  }

  @Post('oidc/callback')
  @ApiOperation({ summary: 'Handle OIDC callback' })
  async handleOidcCallback(@Body() payload: any) {
    // TODO: Implement OIDC callback handling
    return { message: 'OIDC callback received' };
  }

  /** Development-only: issue a JWT for any email without MitID. Disabled in production. */
  @Post('dev-login')
  @ApiOperation({ summary: '[DEV ONLY] Login with email, bypasses MitID' })
  async devLogin(@Body() dto: DevLoginDto) {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('Dev login is not available in production');
    }

    const user = await this.authService.validateUser(
      `dev-sub:${dto.email}`,
      dto.email,
    );

    if (dto.displayName) {
      await this.authService.updateDisplayName(user.id, dto.displayName);
    }

    const token = this.authService.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: dto.displayName ?? user.displayName ?? dto.email,
      },
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@Request() req: any) {
    return this.authService.findById(req.user.userId);
  }
}
