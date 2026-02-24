import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { InitiateUploadDto } from './dto/initiate-upload.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/applications/:applicationId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Initiate document upload — returns a presigned upload URL',
  })
  @ApiResponse({ status: 201, description: 'Upload URL generated' })
  initiateUpload(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Request() req: any,
    @Body() dto: InitiateUploadDto,
  ) {
    return this.documentsService.initiateUpload(
      applicationId,
      req.user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List documents for an application' })
  list(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Request() req: any,
  ) {
    return this.documentsService.listForApplication(
      applicationId,
      req.user.userId,
    );
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get document metadata' })
  findOne(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Request() req: any,
  ) {
    return this.documentsService.findOne(
      applicationId,
      documentId,
      req.user.userId,
    );
  }
}
