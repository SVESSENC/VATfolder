import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssessObligationDto } from './dto/assess-obligation.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new VAT application (draft)' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(@Request() req: any, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all applications for the authenticated user' })
  list(@Request() req: any) {
    return this.applicationsService.listForUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.applicationsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a draft application' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, req.user.userId, dto);
  }

  @Post(':id/assess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run obligation assessment for an application' })
  assess(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: AssessObligationDto,
  ) {
    return this.applicationsService.assess(id, req.user.userId, dto);
  }
}
