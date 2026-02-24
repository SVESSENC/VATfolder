import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ValidationService } from './validation.service';
import { ValidateApplicationDto } from './dto/validate-application.dto';

@ApiTags('Validation')
@Controller()
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Get('api/v1/validation/rulesets')
  @ApiOperation({ summary: 'List available validation rulesets' })
  getRulesets() {
    return this.validationService.getRulesets();
  }

  @Post('api/v1/applications/:id/validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a VAT application against the ruleset' })
  @ApiResponse({ status: 200, description: 'Validation result returned' })
  validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: ValidateApplicationDto,
  ) {
    return this.validationService.validate(id, req.user.userId, dto);
  }
}
